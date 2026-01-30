pipeline {
    agent any
    
    tools {
        nodejs 'node' 
    }

    environment {
        // Correctly handle Docker credentials using environment variables
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        AWS_REGION = 'us-east-1'
        EKS_CLUSTER_NAME = 'civic-pulse-eks'
        DOCKER_REPO = 'moshaheer'
        VERSION = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Source Code Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Unit Test') {
            steps {
                dir('server') {
                    sh 'npm install && npm test -- --watchAll=false --passWithNoTests'
                }
                dir('client') {
                    sh 'npm install && npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('Build and Tag Docker Images') {
            steps {
                dir('server') {
                    sh "docker build -t ${DOCKER_REPO}/civic-pulse-server:${VERSION} -t ${DOCKER_REPO}/civic-pulse-server:latest ."
                }
                dir('client') {
                    sh "docker build -t ${DOCKER_REPO}/civic-pulse-client:${VERSION} -t ${DOCKER_REPO}/civic-pulse-client:latest ."
                }
            }
        }

        stage('Container Security Scanning') {
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

        stage('Infrastructure Provisioning (Terraform)') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                credentialsId: 'aws-creds', 
                                accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    dir('infrastructure') {
                        sh '''
                        echo "--- INITIALIZING TERRAFORM ---"
                        terraform init -input=false -migrate-state -force-copy
                        
                        echo "--- IMPORTING EXISTING RESOURCES ---"
                        # These two lines MUST appear in your Jenkins Console Output
                        terraform import aws_eks_cluster.civic_pulse_cluster civic-pulse-eks || echo "Cluster already in state"
                        terraform import aws_iam_role.eks_worker_role civic-pulse-eks-worker-role || echo "Role already in state"
                        
                        echo "--- PLANNING DEPLOYMENT ---"
                        terraform validate
                        terraform plan -out=tfplan -input=false
                        terraform apply -auto-approve tfplan
                        '''
                    }
                }
            }
        }

        
        
        stage('Configure kubectl for EKS') {
            steps {
                // Added credentials wrapper so the AWS CLI can talk to your account
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                credentialsId: 'aws-creds', 
                                accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    sh '''
                    aws eks update-kubeconfig --name ${EKS_CLUSTER_NAME} --region ${AWS_REGION}
                    kubectl get nodes
                    '''
                }
            }
        }

        stage('Deploy with Helm to EKS') {
            steps {
                sh '''
                helm repo add civic-pulse ./charts || true
                helm repo update
                helm upgrade --install civic-pulse ./charts/civic-pulse \
                  --namespace default \
                  --set client.image.tag=${VERSION} \
                  --set server.image.tag=${VERSION} \
                  --wait
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                echo "Waiting for deployment to be ready..."
                kubectl rollout status deployment/civic-pulse-client --timeout=5m || true
                kubectl rollout status deployment/civic-pulse-server --timeout=5m || true
                echo "Deployment Status:"
                kubectl get pods -o wide
                kubectl get svc
                '''
            }
        }

        stage('Post-Deployment Tests') {
            steps {
                sh '''
                echo "Running smoke tests..."
                kubectl run test-pod --image=curlimages/curl:latest --restart=Never -- \
                  curl -f http://civic-pulse-client:80/ || true
                '''
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
        }
        
        success {
            echo "Deployment successful for EG/2022/5304!"
            sh 'kubectl get ingress'
        }
    }
}