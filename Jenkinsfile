pipeline {
    agent any

    environment {
        GCP_PROJECT_ID = 'jenkins-poc-402417'
        APP_IMAGE_NAME = 'express-app'
        GAR_REGION = 'us-east1' // Define the region for Artifact Registry
        GKE_CLUSTER_NAME = 'multipipeline'
        K8S_NAMESPACE = 'default'
    }

    stages {
        stage('Git Checkout') {
            steps {
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
                // Clean the workspace
                deleteDir()

                withCredentials([file(credentialsId: "jenkins-poc-402417", variable: 'GC_KEY')]) {
                    sh "cp \${GC_KEY} \${WORKSPACE}/cred1.json"
                }
                script {
                    sh "gcloud auth activate-service-account --key-file=\${WORKSPACE}/cred1.json"
                    sh "docker tag express-app:latest ${GAR_REGION}-docker.pkg.dev/\${GCP_PROJECT_ID}/hello-repo/\${APP_IMAGE_NAME}:${env.BUILD_ID}"
                    sh "gcloud auth configure-docker ${GAR_REGION}-docker.pkg.dev"
                    sh "docker push ${GAR_REGION}-docker.pkg.dev/\${GCP_PROJECT_ID}/hello-repo/\${APP_IMAGE_NAME}:${env.BUILD_ID}"
                }
            }
        }

        stage('Deploy to GKE') {
            steps {
                script {
                    gcloud(
                        project: 'jenkins-poc-402417', // Set the desired project explicitly
                        credentialsId: 'jenkins-poc-402417',
                        clusterName: GKE_CLUSTER_NAME,
                        zone: 'us-east1-b'
                    )
                    sh "gcloud container clusters get-credentials ${GKE_CLUSTER_NAME} --zone us-east1-b --project jenkins-poc-402417" // Explicitly set the project

                    // Check if deployment.yaml exists before using sed
                    if (fileExists("deployment.yaml")) {
                        sh "sed -i 's/tagversion/${env.BUILD_ID}/g' deployment.yaml"
                        sh "kubectl apply -f deployment.yaml -n ${K8S_NAMESPACE}"
                        sh "kubectl apply -f service.yaml -n ${K8S_NAMESPACE}"
                    } else {
                        error("deployment.yaml not found in the workspace.")
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded!'
            emailext (
                subject: 'Pipeline Succeeded',
                body: 'Your Jenkins pipeline has succeeded!',
                to: 'saipreethipottella@gmail.com',
                attachLog: false
            )
        }
        failure {
            echo 'Pipeline failed!'
            emailext (
                subject: 'Pipeline Failed',
                body: 'Your Jenkins pipeline has failed. Please look into it!',
                to: 'saipreethipottella@gmail.com',
                attachLog: true
            )
        }
    }
}
