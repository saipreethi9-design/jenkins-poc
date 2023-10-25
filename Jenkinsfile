pipeline {
    agent any

    environment {
        GCP_PROJECT_ID = 'bold-catfish-402405'
        APP_IMAGE_NAME = 'express-app'
        GAR_REGION = 'us-east1' // Define the region for Artifact Registry
        GKE_CLUSTER_NAME = 'jenkins-poc'
        K8S_NAMESPACE = 'default'
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
                    sh """
                    gcloud auth activate-service-account --key-file= ${GC_KEY}
                    docker tag express-app:latest ${GAR_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/jenkins-repo/${APP_IMAGE_NAME}:${env.BUILD_ID}
                    gcloud auth configure-docker us-east1-docker.pkg.dev
                    docker push ${GAR_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/jenkins-repo/${APP_IMAGE_NAME}:${env.BUILD_ID}
                    """
                }
            }
        }

        stage('Deploy to GKE') {
            steps {
                script {
                    // Authenticate to GKE cluster
                    gcloud(project: GCP_PROJECT_ID, credentialsId: 'bold-catfish-402405', clusterName: GKE_CLUSTER_NAME, zone: 'us-east1-b')

                    // Set the Kubectl context to your GKE cluster
                    sh "gcloud container clusters get-credentials ${GKE_CLUSTER_NAME} --zone us-east1-b"

                    sh "sed -i 's/tagversion/${env.BUILD_ID}/g' deployment.yaml"

                    // Apply the Kubernetes manifest to deploy the application
                    sh "kubectl apply -f deployment.yaml -n ${K8S_NAMESPACE}"
                    sh "kubectl apply -f service.yaml -n ${K8S_NAMESPACE}"
                    cleanWs()
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
