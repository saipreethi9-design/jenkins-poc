pipeline {
    agent any

    environment {
        GCP_PROJECT_ID = 'bold-catfish-402405'
        APP_IMAGE_NAME = 'express-app'
        GAR_REGION = 'us-east1' // Define the region for Artifact Registry
        APP_ENGINE_SERVICE = 'default'
    }

    stages {
        stage('Git Checkout') {
            steps {
                // Check out the source code from your Git repository
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker version'
                sh 'docker build -t express-app .'
                sh 'docker image list'
            }
        }

        stage("Push Image to Artifact Registry") {
            steps {
                withCredentials([file(credentialsId: "bold-catfish-402405", variable: 'GC_KEY')]) {
                    sh "cp ${env:GC_KEY} cred.json"
                }
                script {
                    sh "gcloud auth activate-service-account --key-file=cred.json"
                    sh "docker tag express-app:latest ${GAR_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/jenkins-repo/${APP_IMAGE_NAME}:${env.BUILD_ID}"
                    sh "gcloud auth configure-docker ${GAR_REGION}-docker.pkg.dev"
                    sh "docker push ${GAR_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/jenkins-repo/${APP_IMAGE_NAME}:${env.BUILD_ID}"
                }
            }
        }

        stage('Deploy to App Engine') {
            steps {
                script {
                    // Authenticate with Google Cloud
                    withCredentials([googleApplicationDefaultCredentials()]) {
                        sh "gcloud config set project ${GCP_PROJECT_ID}"

                        // Deploy the application to Google App Engine
                        sh "gcloud app deploy app.yaml --promote --project ${GCP_PROJECT_ID} --version ${env.BUILD_ID} --stop-previous-version"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded!'
            // Send a success notification
            emailext (
                subject: 'Pipeline Succeeded',
                body: 'Your Jenkins pipeline has succeeded!',
                to: 'saipreethipottella@gmail.com',
                attachLog: false
            )
        }
        failure {
            echo 'Pipeline failed!'
            // Send a failure notification
            emailext (
                subject: 'Pipeline Failed',
                body: 'Your Jenkins pipeline has failed. Please look into it!',
                to: 'saipreethipottella@gmail.com',
                attachLog: true
            )
        }
    }
}
