pipeline {
    agent any
    environment {
        GCP_PROJECT_ID = 'bold-catfish-402405'
        APP_IMAGE_NAME = 'express-app'
        GAR_REGION = 'us-east1' 
        GKE_CLUSTER_NAME = 'jenkins-poc'
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
                script {
                    // Delete cred.json if it already exists
                    sh "rm -f cred.json"

                    withCredentials([file(credentialsId: "bold-catfish-402405", variable: 'GC_KEY')]) {
                        sh "cp ${env:GC_KEY} cred.json"
                    }

                    sh "gcloud auth activate-service-account --key-file=cred.json"
                    sh "docker tag express-app:latest ${GAR_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/jenkins-repo/${APP_IMAGE_NAME}:${env.BUILD_ID}"
                    sh "gcloud auth configure-docker ${GAR_REGION}-docker.pkg.dev"
                    sh "docker push ${GAR_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/jenkins-repo/${APP_IMAGE_NAME}:${env.BUILD_ID}"
                }
            }
        }
        stage('Deploy to GKE') {
            steps {
                script {
                    gcloud(project: GCP_PROJECT_ID, credentialsId: 'bold-catfish-402405', clusterName: GKE_CLUSTER_NAME, zone: 'us-east1-b')
                    sh "gcloud container clusters get-credentials ${GKE_CLUSTER_NAME} --zone us-east1-b"
                    sh "sed -i 's/tagversion/${env.BUILD_ID}/g' deployment.yaml"
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
        }
        
        always {
                // Send email notification regardless of build status
                emailext (
                    subject: "Build ${currentBuild.currentResult}: Job '${env.JOB_NAME}'",
                    body: "Build ${currentBuild.currentResult}: Job '${env.JOB_NAME}' (${env.BUILD_URL})",
                    to: 'saipreethi371@gmail.com',
                    attachLog: true
                )
            }
        }
}
