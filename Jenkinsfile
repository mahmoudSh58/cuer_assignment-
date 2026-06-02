pipeline {
    agent any

    environment {
        AWS_REGION  = 'us-east-1'
        CLUSTER_NAME = 'cuer-assign'
        ECR_REPO = '617998378772.dkr.ecr.us-east-1.amazonaws.com/cuer_assign/nodjs-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/mahmoudSh58/cuer_assignment-.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install
                '''
            }
        }


        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                    trivy fs \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    .
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                    -t nodejs-app:${IMAGE_TAG} .
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                    trivy image \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    nodejs-app:${IMAGE_TAG}
                '''
            }
        }

        
        stage('Login To ECR') {
            steps {
                sh '''
                    aws ecr get-login-password \
                    --region $AWS_REGION | \
                    docker login \
                    --username AWS \
                    --password-stdin \
                    123456789012.dkr.ecr.us-east-1.amazonaws.com
                '''
            }
        }

        stage('Push Image To ECR') {
            steps {
                sh '''
                    docker tag nodejs-app:${IMAGE_TAG} \
                    ${ECR_REPO}:${IMAGE_TAG}

                    docker push \
                    ${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }

        stage('Connect To EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig \
                    --region $AWS_REGION \
                    --name $CLUSTER_NAME
                '''
            }
        }

        stage('Deploy To EKS') {
            steps {
                sh '''
                    kubectl set image deployment/nodejs-app \
                    nodejs-app=${ECR_REPO}:${IMAGE_TAG}

                    kubectl rollout status deployment/nodejs-app
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl get pods
                    kubectl get svc
                    kubectl get ingress
                '''
            }
        }
    }

    post {

        success {
            echo 'Deployment Successful'
        }

        failure {
            echo 'Deployment Failed'
        }

        always {
            sh '''
                docker image prune -af || true
            '''
        }
    }
}
