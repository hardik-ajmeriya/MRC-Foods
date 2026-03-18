pipeline {
    agent any

    environment {
        IMAGE_NAME = "mrc-foods"
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

        stage('Deploy Staging') {
            when {
                expression { env.GIT_BRANCH?.contains('dev') || env.BRANCH_NAME == 'dev' }
            }

            steps {
                withCredentials([file(credentialsId: 'mrc-staging-env', variable: 'ENV_FILE')]) {

                    sh """
                    docker stop mrc-staging || true
                    docker rm mrc-staging || true

                    docker run -d \
                      --name mrc-staging \
                      -p 5001:5000 \
                      --env-file \$ENV_FILE \
                      $IMAGE_NAME:$GIT_COMMIT_SHORT
                    """
                }
            }
        }

        stage('Deploy Production') {
            when {
                expression { env.GIT_BRANCH?.contains('main') || env.BRANCH_NAME == 'main' }
            }

            steps {
                input message: "Deploy to Production?"

                withCredentials([file(credentialsId: 'mrc-production-env', variable: 'ENV_FILE')]) {

                    sh """
                    docker stop mrc-prod || true
                    docker rm mrc-prod || true

                    docker run -d \
                      --name mrc-prod \
                      -p 5000:5000 \
                      --env-file \$ENV_FILE \
                      $IMAGE_NAME:$GIT_COMMIT_SHORT
                    """
                }
            }
        }
    }
}