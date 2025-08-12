pipeline {
    agent any

    tools {
        nodejs "NodeJS 20"
    }

    environment {
        YARN_VERSION = '1.22.22'
        PORT = '4100'
    }

    stages {
        stage('Deploy to Server') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'jenkins-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'FRONTEND_SERVER_SSH', variable: 'FRONTEND_SERVER_SSH'),
                    string(credentialsId: 'FRONTEND_GITHUB_KEY', variable: 'GITHUB_PAT'),
                    string(credentialsId: 'FRONTEND_CML_DEPLOYMENT_DIRECTORY', variable: 'DEPLOYMENT_DIRECTORY'),
                    string(credentialsId: 'FRONTEND_CML_DEPLOYMENT_BRANCH', variable: 'DEPLOYMENT_BRANCH'),
                    string(credentialsId: 'FRONTEND_CML_DEPLOYMENT_NAME', variable: 'DEPLOYMENT_NAME'),
                    string(credentialsId: 'FRONTEND_CML_NEXT_PUBLIC_HHM_BASE_URL', variable: 'NEXT_PUBLIC_HHM_BASE_URL'),
                    string(credentialsId: 'FRONTEND_CML_NEXT_PUBLIC_FEDERATED_BASE_URL', variable: 'NEXT_PUBLIC_FEDERATED_BASE_URL'),
                    string(credentialsId: 'FRONTEND_CML_NEXT_PUBLIC_MAP_BASE_URL', variable: 'NEXT_PUBLIC_MAP_BASE_URL')
                ]) {
                    sh """

                    ssh -o StrictHostKeyChecking=no "${FRONTEND_SERVER_SSH}" <<'EOF'
                    set -e  # Stop execution on first failure

                    export NVM_DIR="\$HOME/.nvm"
                    [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
                    [ -s "\$NVM_DIR/bash_completion" ] && . "\$NVM_DIR/bash_completion"

                    echo "Using Node.js version:"
                    source ~/.bashrc
                    nvm use 20 || { echo "NVM failed!"; exit 1; }
                    node -v

                    echo "Using Yarn version:"
                    yarn -v

                    export GITHUB_PAT="${GITHUB_PAT}"
                    export GIT_URL="https://x-access-token:\$GITHUB_PAT@github.com/metastring/cml-ui-poc.git"
                    export DEPLOY_DIRECTORY="${DEPLOYMENT_DIRECTORY}"

                    GIT_RESPONSE=\$(git ls-remote "\$GIT_URL" 2>&1)
                    EXIT_CODE=\$?

                    if [ "\$EXIT_CODE" -ne 0 ]; then
                        echo "❌ GitHub repository not accessible!"
                        exit 1
                    fi

                    if [ ! -d "\$DEPLOY_DIRECTORY" ]; then
                        echo "Cloning repository..."
                        git clone "\$GIT_URL" "\$DEPLOY_DIRECTORY"
                    fi

                    cd "\$DEPLOY_DIRECTORY"

                    export DEPLOY_BRANCH="${DEPLOYMENT_BRANCH}"

                    git remote set-url origin "\$GIT_URL"

                    git fetch origin || { echo "Git fetch failed!"; exit 1; }
                    git checkout \$DEPLOY_BRANCH || git checkout -b \$DEPLOY_BRANCH origin/\$DEPLOY_BRANCH
                    git pull origin \$DEPLOY_BRANCH

                    echo "Installing dependencies..."
                    if [ ! -f package.json ]; then
                        echo "Error: package.json not found!"
                        exit 1
                    fi
                    yarn install

                    cat > .env <<EOF_ENV
NEXT_PUBLIC_HHM_BASE_URL=${NEXT_PUBLIC_HHM_BASE_URL}
NEXT_PUBLIC_FEDERATED_BASE_URL=${NEXT_PUBLIC_FEDERATED_BASE_URL}
NEXT_PUBLIC_MAP_BASE_URL=${NEXT_PUBLIC_MAP_BASE_URL}
PORT=${PORT}
DEPLOY_NAME=${DEPLOYMENT_NAME}
EOF_ENV

                    # Verify the .env file
                    ls -l .env

                    export \$(grep -v '^#' .env | xargs)

                    echo "Installing dependencies..."
                    yarn install --frozen-lockfile

                    echo "Building Next.js app..."
                    yarn build

                    export PATH=\$PATH:/home/metastring/.nvm/versions/node/v20/bin
                    export PM2_HOME=/home/metastring/.pm2

                    # Check if PM2 is installed
                    if ! command -v pm2 &> /dev/null; then
                        echo "PM2 is not installed! Installing..."
                        npm install -g pm2
                    fi

                    echo "Restarting application..."

                    if pm2 restart "\$DEPLOY_NAME" --update-env; then
                        echo "Application restarted successfully!"
                    else
                        echo "PM2 restart failed. Starting application..."
                        # pm2 start --name "\$DEPLOY_NAME" "yarn start -p \$PORT"
                        pm2 start yarn --interpreter bash --name "\$DEPLOY_NAME" -- start
                        echo "Application started successfully!"
                    fi


                    pm2 save
EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed. Check logs.'
            error("Stopping pipeline due to failure.")
        }
    }
}
