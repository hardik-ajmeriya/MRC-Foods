pipeline {
    agent any

    environment {
        IMAGE_NAME = "mrc-foods"
        CONTAINER_STAGING = "mrc-staging"
        PORT_STAGING = "5001"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    env.GIT_COMMIT_SHORT = bat(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }

                sh """
                docker build -t $IMAGE_NAME:$GIT_COMMIT_SHORT .
                """
            }
        }

        stage('Deploy to Staging') {
            steps {
                withCredentials([file(credentialsId: 'mrc-staging-env', variable: 'ENV_FILE')]) {

                    sh """
                    docker stop $CONTAINER_STAGING || true
                    docker rm $CONTAINER_STAGING || true

                    docker run -d \
                      --name $CONTAINER_STAGING \
                      -p $PORT_STAGING:5000 \
                      --env-file \$ENV_FILE \
                      $IMAGE_NAME:$GIT_COMMIT_SHORT
                    """
                }
            }
        }

        // 💣 INTENTIONAL FAILURE STAGE
        stage('Health Check (Will Fail)') {
            steps {
                sh """
                echo "Waiting for app..."
                sleep 5

                echo "Running health check..."

                curl -f http://localhost:$PORT_STAGING/health || (
                  echo "❌ HEALTH CHECK FAILED - SERVICE UNHEALTHY"
                  exit 1
                )
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline Success"
        }
        failure {
            echo "🚨 Pipeline Failed - Trigger AI Analysis"
        }
    }
}