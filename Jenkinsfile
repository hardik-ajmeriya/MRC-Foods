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

        stage('Detect Branch') {
            steps {
                script {
                    env.ACTUAL_BRANCH = sh(
                        script: "git rev-parse --abbrev-ref HEAD",
                        returnStdout: true
                    ).trim()

                    echo "🔥 Detected Branch: ${env.ACTUAL_BRANCH}"
                }
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
                script {

                    echo "🔥 Branch detected: ${env.BRANCH_NAME}"

                    // ✅ DEV → STAGING
                    if (env.BRANCH_NAME?.contains("dev")) {

                        echo "🚀 Deploying to STAGING (5001)"

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
                    // ✅ MAIN → PRODUCTION
                    else {

                        echo "🚀 Deploying to PRODUCTION (5000)"

                        withCredentials([
                            file(credentialsId: 'mrc-prod-env', variable: 'ENV_FILE')
                        ]) {
                            sh '''
                            docker pull $IMAGE:$TAG

                            docker stop mrc-prod || true
                            docker rm mrc-prod || true

                            docker run -d \
                              --name mrc-prod \
                              -p 5000:5000 \
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

                    if (env.BRANCH_NAME?.contains("dev")) {
                        echo "🔍 Checking STAGING health..."
                        sh 'sleep 5 && curl -f http://localhost:5001/health'
                    } else {
                        echo "🔍 Checking PROD health..."
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
                if (env.BRANCH_NAME?.contains("dev")) {
                    sh '''
                    docker stop mrc-staging || true
                    docker rm mrc-staging || true

                    docker run -d \
                      --name mrc-staging \
                      -p 5001:5000 \
                      $IMAGE:latest
                    '''
                } else {
                    sh '''
                    docker stop mrc-prod || true
                    docker rm mrc-prod || true

                    docker run -d \
                      --name mrc-prod \
                      -p 5000:5000 \
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