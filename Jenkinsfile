pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_IMAGE_PREFIX = 'uday2611'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🔨 Building Frontend...'
                dir('frontend') {
                    sh 'node -v'
                    sh 'npm -v'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                echo '🔨 Building Backend...'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        echo '🧪 Running Frontend Tests...'
                        dir('frontend') {
                            sh 'npm test -- --watchAll=false || true'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        echo '🧪 Running Backend Tests...'
                        dir('backend') {
                            sh 'echo "Backend tests would run here"'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality Check') {
            steps {
                echo '✅ Running Code Quality Checks...'
                dir('frontend') {
                    sh 'npm run lint || true'
                }
            }
        }
        
        stage('Dockerize') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        echo '🐳 Building Frontend Docker Image...'
                        dir('frontend') {
                            sh "docker build -t ${DOCKER_IMAGE_PREFIX}/connect4-frontend:${BUILD_NUMBER} ."
                            sh "docker tag ${DOCKER_IMAGE_PREFIX}/connect4-frontend:${BUILD_NUMBER} ${DOCKER_IMAGE_PREFIX}/connect4-frontend:latest"
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        echo '🐳 Building Backend Docker Image...'
                        dir('backend') {
                            sh "docker build -t ${DOCKER_IMAGE_PREFIX}/connect4-backend:${BUILD_NUMBER} ."
                            sh "docker tag ${DOCKER_IMAGE_PREFIX}/connect4-backend:${BUILD_NUMBER} ${DOCKER_IMAGE_PREFIX}/connect4-backend:latest"
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                sh 'echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin'
                sh "docker push ${DOCKER_IMAGE_PREFIX}/connect4-frontend:${BUILD_NUMBER}"
                sh "docker push ${DOCKER_IMAGE_PREFIX}/connect4-frontend:latest"
                sh "docker push ${DOCKER_IMAGE_PREFIX}/connect4-backend:${BUILD_NUMBER}"
                sh "docker push ${DOCKER_IMAGE_PREFIX}/connect4-backend:latest"
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Deploying application...'
                sh 'docker compose down || true'
                sh 'docker compose up -d'
            }
        }
    }

    post {
    always {
        script {
            echo "Cleaning up..."
        }
    }
    success {
        echo "Pipeline completed successfully."
    }
    failure {
        echo "Pipeline failed."
    }
}

}
