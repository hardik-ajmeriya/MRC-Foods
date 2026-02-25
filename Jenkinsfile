pipeline {
  agent any

  environment {
    APP_NAME = 'mrc-foods'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t mrc-foods .'
      }
    }

    stage('Create .env from Secret') {
      steps {
        withCredentials([string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI')]) {
          sh '''
            echo "MONGODB_URI=$MONGO_URI" > backend/.env
            echo "PORT=5000" >> backend/.env
          '''
        }
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          docker stop mrc-foods || true
          docker rm mrc-foods || true

          docker run -d \
            --name mrc-foods \
            -p 5000:5000 \
            --env-file backend/.env \
            mrc-foods
        '''
      }
    }
  }

  post {
    success {
      echo 'Secure Deployment Successful'
      sh 'docker ps'
    }
    failure {
      echo 'Build failed'
      sh 'docker logs mrc-foods || true'
    }
  }
}