pipeline {
  agent any

  environment {
    APP_NAME = 'mrc-foods'
    IMAGE_TAG = 'latest'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          docker build -t mrc-foods .
        '''
      }
    }

    stage('Prepare Env File') {
      steps {
        sh '''
          echo "MONGODB_URI=YOUR_ATLAS_URI" > backend/.env
          echo "PORT=5000" >> backend/.env
        '''
      }
    }

    stage('Stop Old Container') {
      steps {
        sh '''
          docker stop mrc-foods || true
          docker rm mrc-foods || true
        '''
      }
    }

    stage('Run Container') {
      steps {
        sh '''
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
      echo 'Build + Deploy successful'
      sh 'docker ps'
    }
    failure {
      echo 'Build failed'
      sh 'docker logs mrc-foods || true'
    }
  }
}
