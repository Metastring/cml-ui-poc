pipeline {
    agent any

    environment {
        WORK_DIR = '/home/metastring/src/github/cml/cml-ui-poc'
    }

    stages {
        stage('Deploy Code') {
            steps {
                sh '''
                rsync -av --delete \
                  --no-owner \
                  --no-group \
                  --no-perms \
                  --omit-dir-times \
                  --exclude '.git/' \
                  --exclude '.env.local' \
                  --exclude 'node_modules/' \
                  --exclude '.next/' \
                  ${WORKSPACE}/ \
                  ${WORK_DIR}/
                '''
            }
        }

        stage('Install & Build') {
            steps {
                sh '''
                cd ${WORK_DIR}
                yarn install --frozen-lockfile
                yarn build
                '''
            }
        }

        stage('Restart Frontend Service') {
            steps {
                sh '''
                sudo systemctl restart cml_ui_poc
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful'
        }
        failure {
            echo '❌ Deployment Failed'
        }
    }
}
