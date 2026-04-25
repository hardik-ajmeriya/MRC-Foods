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
                        script: "git branch --show-current || echo dev",
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
            when {
                expression { env.ACTUAL_BRANCH == "dev" }
            }
            steps {
                echo "🚀 Deploying to STAGING (port 5001)"

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

        stage('Health Check (Staging)') {
            when {
                expression { env.ACTUAL_BRANCH == "dev" }
            }
            steps {
                echo "🔍 Checking STAGING health..."
                sh 'sleep 5 && curl -f http://localhost:5001/health'
            }
        }

        stage('Skip Production') {
            when {
                expression { env.ACTUAL_BRANCH != "dev" }
            }
            steps {
                echo "⚠️ Production deploy skipped (not main branch)"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS 🚀"
        }

        failure {
            echo "❌ Pipeline FAILED"
        }

        always {
            sh 'docker system prune -f || true'
        }
    }
}