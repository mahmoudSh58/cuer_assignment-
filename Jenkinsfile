pipeline {
    agent any

    environment {
        AWS_REGION  = 'us-east-1'
        CLUSTER_NAME = 'my-cluster'
        ECR_REPO = '123456789012.dkr.ecr.us-east-1.amazonaws.com/nodejs-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-org/nodejs-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    npm test
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

        stage('Configure AWS') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                        aws configure set region $AWS_REGION
                    '''
                }
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
