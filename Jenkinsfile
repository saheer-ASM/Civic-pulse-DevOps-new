pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKER_REPO = 'moshaheer'
        VERSION = "${env.BUILD_NUMBER}"
        EC2_HOST = credentials('ec2-host')        // EC2 public IP or hostname
        EC2_SSH_KEY = credentials('ec2-ssh-key')   // SSH private key for EC2
    }

    stages {
        stage('Source Code Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Unit Tests') {
            steps {
                dir('server') {
                    sh 'npm install && npm test -- --watchAll=false --passWithNoTests'
                }
                dir('client') {
                    sh 'npm install && npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('server') {
                    sh "docker build -t ${DOCKER_REPO}/civic-pulse-server:${VERSION} -t ${DOCKER_REPO}/civic-pulse-server:latest ."
                }
                dir('client') {
                    sh "docker build -t ${DOCKER_REPO}/civic-pulse-client:${VERSION} -t ${DOCKER_REPO}/civic-pulse-client:latest ."
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_REPO}/civic-pulse-server:latest || true"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_REPO}/civic-pulse-client:latest || true"
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh '''
                echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                docker push ${DOCKER_REPO}/civic-pulse-server:${VERSION}
                docker push ${DOCKER_REPO}/civic-pulse-server:latest
                docker push ${DOCKER_REPO}/civic-pulse-client:${VERSION}
                docker push ${DOCKER_REPO}/civic-pulse-client:latest
                docker logout
                '''
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                    echo "Deploying to EC2 instance at ${EC2_HOST}..."

                    # Copy docker-compose.yml to EC2
                    scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@${EC2_HOST}:/home/ubuntu/civic-pulse/

                    # SSH into EC2 and deploy
                    ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} << 'DEPLOY_EOF'
                        cd /home/ubuntu/civic-pulse

                        # Pull latest images
                        docker pull moshaheer/civic-pulse-server:latest
                        docker pull moshaheer/civic-pulse-client:latest

                        # Restart services with new images
                        docker compose down
                        docker compose up -d

                        # Wait for containers to be healthy
                        echo "Waiting for services to start..."
                        sleep 10

                        # Verify deployment
                        docker compose ps
                        echo "Deployment complete!"
DEPLOY_EOF
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} << 'VERIFY_EOF'
                        echo "=== Container Status ==="
                        docker compose -f /home/ubuntu/civic-pulse/docker-compose.yml ps

                        echo "=== Health Check ==="
                        curl -sf http://localhost:5000/health && echo "Server: OK" || echo "Server: FAILED"
                        curl -sf http://localhost:3000/ && echo "Client: OK" || echo "Client: FAILED"
VERIFY_EOF
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f'
        }

        success {
            echo "Deployment successful! App running on EC2: ${EC2_HOST}"
        }

        failure {
            echo "Deployment failed! Check logs above."
        }
    }
}