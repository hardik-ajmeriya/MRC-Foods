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
                    // In non-multibranch jobs checkout can be detached, so prefer Jenkins vars first.
                    def detectedBranch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: env.CHANGE_BRANCH ?: '').trim()

                    if (!detectedBranch) {
                        detectedBranch = sh(
                            script: "git branch -r --contains HEAD | sed -n 's#.*origin/##p' | head -n 1",
                            returnStdout: true
                        ).trim()
                    }

                    detectedBranch = detectedBranch
                        .replaceFirst('^origin/', '')
                        .replaceFirst('^refs/heads/', '')

                    if (!detectedBranch || detectedBranch == 'HEAD') {
                        error "Unable to resolve branch. BRANCH_NAME='${env.BRANCH_NAME}', GIT_BRANCH='${env.GIT_BRANCH}'"
                    }

                    env.ACTUAL_BRANCH = detectedBranch
                    env.DEPLOY_TARGET = env.ACTUAL_BRANCH == 'dev'
                        ? 'staging'
                        : (env.ACTUAL_BRANCH == 'main' ? 'production' : 'none')

                    echo "Detected branch: ${env.ACTUAL_BRANCH}"
                    echo "Deploy target: ${env.DEPLOY_TARGET}"
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

        stage('Deploy') {
            steps {
                script {
                    echo "Branch detected: ${env.ACTUAL_BRANCH}"
                    echo "Deploy target: ${env.DEPLOY_TARGET}"

                    if (env.DEPLOY_TARGET == 'staging') {
                        echo "Deploying to STAGING (5001)"

                        try {
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
                        } catch (Exception ex) {
                            error "Missing Jenkins credential 'mrc-staging-env' (type: Secret file)."
                        }
                    } else if (env.DEPLOY_TARGET == 'production') {
                        echo "Deploying to PRODUCTION (5000)"

                        try {
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
                        } catch (Exception ex) {
                            error "Missing Jenkins credential 'mrc-prod-env' (type: Secret file)."
                        }
                    } else {
                        error "Unsupported branch '${env.ACTUAL_BRANCH}'. Only 'dev' and 'main' are deployable."
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    if (env.DEPLOY_TARGET == 'staging') {
                        echo "Checking STAGING health..."
                        sh 'sleep 5 && curl -f http://localhost:5001/api/health'
                    } else if (env.DEPLOY_TARGET == 'production') {
                        echo "Checking PROD health..."
                        sh 'sleep 5 && curl -f http://localhost:5000/api/health'
                    } else {
                        error "Health check skipped: unsupported deploy target '${env.DEPLOY_TARGET}'"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful.'
        }

        failure {
            echo 'Deployment failed. Starting rollback.'

            script {
                if (env.DEPLOY_TARGET == 'staging') {
                    sh '''
                    docker stop mrc-staging || true
                    docker rm mrc-staging || true

                    docker run -d \
                      --name mrc-staging \
                      -p 5001:5000 \
                      $IMAGE:latest
                    '''
                } else if (env.DEPLOY_TARGET == 'production') {
                    sh '''
                    docker stop mrc-prod || true
                    docker rm mrc-prod || true

                    docker run -d \
                      --name mrc-prod \
                      -p 5000:5000 \
                      $IMAGE:latest
                    '''
                } else {
                    echo 'Rollback skipped: no deploy target was selected.'
                }
            }
        }

        always {
            sh 'docker system prune -f || true'
        }
    }
}