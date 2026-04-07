pipeline {
    agent any

    environment {
        IMAGE_NAME = "mrc-foods"
        CONTAINER_STAGING = "mrc-staging"
        CONTAINER_PROD = "mrc-prod"
        PORT_STAGING = "5001"
        PORT_PROD = "5000"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Version') {
            steps {
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()

                    env.BUILD_TAG = "${env.IMAGE_NAME}:${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t $BUILD_TAG .
                docker tag $BUILD_TAG $IMAGE_NAME:latest
                """
            }
        }

        // 🔥 OPTIONAL: Intentional Failure Toggle
        stage('Simulate Failure (Optional)') {
            when {
                expression { return params.FAIL_PIPELINE == true }
            }
            steps {
                sh "echo 'Simulated failure triggered' && exit 1"
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'dev'
            }

            steps {
                withCredentials([file(credentialsId: 'mrc-staging-env', variable: 'ENV_FILE')]) {

                    sh """
                    docker stop $CONTAINER_STAGING || true
                    docker rm $CONTAINER_STAGING || true

                    docker run -d \
                      --name $CONTAINER_STAGING \
                      -p $PORT_STAGING:5000 \
                      --env-file \$ENV_FILE \
                      $BUILD_TAG
                    """
                }
            }
        }

        // 🔥 REAL DEVOPS ADDITION
        stage('Health Check (Staging)') {
            when {
                branch 'dev'
            }

            steps {
                sh """
                echo "Waiting for service..."
                sleep 5

                curl -f http://localhost:$PORT_STAGING/health || (
                  echo "Health check failed 🚨"
                  exit 1
                )
                """
            }
        }

        stage('Approval for Production') {
            when {
                branch 'main'
            }

            steps {
                input message: "Deploy to Production?"
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }

            steps {
                withCredentials([file(credentialsId: 'mrc-production-env', variable: 'ENV_FILE')]) {

                    sh """
                    docker stop $CONTAINER_PROD || true
                    docker rm $CONTAINER_PROD || true

                    docker run -d \
                      --name $CONTAINER_PROD \
                      -p $PORT_PROD:5000 \
                      --env-file \$ENV_FILE \
                      $BUILD_TAG
                    """
                }
            }
        }

        // 🔥 PRODUCTION HEALTH CHECK
        stage('Health Check (Production)') {
            when {
                branch 'main'
            }

            steps {
                sh """
                echo "Checking production health..."
                sleep 5

                curl -f http://localhost:$PORT_PROD/health || (
                  echo "Production health failed 🚨"
                  exit 1
                )
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully"
        }
        failure {
            echo "❌ Pipeline failed - investigate logs"
        }
    }
}