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

        CONTAINER_STAGING = "mrc-staging"
        PORT_STAGING = "5001"

        CONTAINER_PROD = "mrc-prod"
        PORT_PROD = "5000"
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

        stage('Deploy') {
            steps {
                script {

                    if (env.BRANCH_NAME == "dev") {

                        echo "🚀 Deploying to STAGING..."

                        withCredentials([
                            file(credentialsId: 'mrc-staging-env', variable: 'ENV_FILE')
                        ]) {
                            sh '''
                            docker pull $IMAGE:$TAG

                            docker stop $CONTAINER_STAGING || true
                            docker rm $CONTAINER_STAGING || true

                            docker run -d \
                              --name $CONTAINER_STAGING \
                              -p $PORT_STAGING:5000 \
                              --env-file $ENV_FILE \
                              $IMAGE:$TAG
                            '''
                        }

                    } else if (env.BRANCH_NAME == "main") {

                        echo "🚀 Deploying to PRODUCTION..."

                        withCredentials([
                            file(credentialsId: 'mrc-prod-env', variable: 'ENV_FILE')
                        ]) {
                            sh '''
                            docker pull $IMAGE:$TAG

                            docker stop $CONTAINER_PROD || true
                            docker rm $CONTAINER_PROD || true

                            docker run -d \
                              --name $CONTAINER_PROD \
                              -p $PORT_PROD:5000 \
                              --env-file $ENV_FILE \
                              $IMAGE:$TAG
                            '''
                        }
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    if (env.BRANCH_NAME == "dev") {
                        sh 'sleep 5 && curl -f http://localhost:5001/health'
                    } else {
                        sh 'sleep 5 && curl -f http://localhost:5000/health'
                    }
                }
            }
        }
    }

    post {

        success {
            echo "✅ Deployment successful 🚀"
        }

        failure {
            echo "❌ Deployment failed — rolling back"

            script {
                if (env.BRANCH_NAME == "dev") {
                    sh '''
                    docker stop $CONTAINER_STAGING || true
                    docker rm $CONTAINER_STAGING || true

                    docker run -d \
                      --name $CONTAINER_STAGING \
                      -p $PORT_STAGING:5000 \
                      $IMAGE:latest
                    '''
                } else {
                    sh '''
                    docker stop $CONTAINER_PROD || true
                    docker rm $CONTAINER_PROD || true

                    docker run -d \
                      --name $CONTAINER_PROD \
                      -p $PORT_PROD:5000 \
                      $IMAGE:latest
                    '''
                }
            }
        }

        always {
            sh 'docker system prune -f || true'
        }
    }
}