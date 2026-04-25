pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        REGISTRY = "hardik558"
        IMAGE_NAME = "mrc-foods"
        IMAGE = "${REGISTRY}/${IMAGE_NAME}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                script {
                    env.TAG = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }

                sh '''
                docker build -t $IMAGE:$TAG .
                docker tag $IMAGE:$TAG $IMAGE:latest
                '''
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    set +x
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    docker push $IMAGE:$TAG
                    docker push $IMAGE:latest

                    docker logout
                    '''
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo "🚀 Deploying to STAGING (forced dev mode)"

                withCredentials([
                    file(credentialsId: 'mrc-staging-env', variable: 'ENV_FILE')
                ]) {
                    sh '''
                    docker pull $IMAGE:$TAG

                    docker stop mrc-staging || true
                    docker rm mrc-staging || true

                    docker run -d \
                      --name mrc-staging \
                      -p 5001:5000 \
                      --env-file $ENV_FILE \
                      $IMAGE:$TAG
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 5 && curl -f http://localhost:5001/health'
            }
        }
    }

    post {
        success {
            echo "Deployment SUCCESS"
        }

        failure {
            echo "Deployment FAILED"
        }

        always {
            sh 'docker system prune -f || true'
        }
    }
}