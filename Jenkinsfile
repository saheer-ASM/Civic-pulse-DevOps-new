pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('server') {
                    sh 'docker build -t moshabeer/civic-pulse-server:latest .'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    sh 'docker build -t moshabeer/civic-pulse-client:latest .'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                docker push moshabeer/civic-pulse-server:latest
                docker push moshabeer/civic-pulse-client:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down && docker-compose up -d'
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
        }
    }
}
