#!/bin/bash

### NEEDED VARIABLES ###
## FROM DEPLOY.CONF
# PROJECT_DIR
###

LIGHT_DEPLOY=false

if [ "$1" = "--light" ]; then
    LIGHT_DEPLOY=true
fi

DEPLOY_START=$(date +%s)

CONFIG_FILE="deploy.conf"

echo "Checking deploy.conf file"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: $CONFIG_FILE not found."
    echo "Please copy 'deploy.conf.example' to '$CONFIG_FILE' and set your variables."
    exit 1
fi

echo "Deploying the last version..."

echo "Going in the project directory"
if ! cd "$PROJECT_DIR"; then
    echo "Error: Could not find directory $PROJECT_DIR"
    exit 1
fi

echo "Checking CI status on GitHub"
if ! command -v gh &>/dev/null; then
    echo "Error: gh not installed. Install it to verify CI before deploy."
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>&1) || {
    echo "Error: $REPO"
    exit 1
}

LATEST_COMMIT=$(git ls-remote origin main | cut -f1)
CI_STATUS=$(gh api "repos/$REPO/commits/$LATEST_COMMIT/status" --jq '.state')

if [ "$CI_STATUS" = "success" ]; then
    echo "CI passed"
elif [ "$CI_STATUS" = "pending" ]; then
    echo "Error: CI still running. Wait for it to finish before deploying."
    exit 1
elif [ -z "$CI_STATUS" ] || [ "$CI_STATUS" = "null" ]; then
    echo "Error: could not determine CI status (no workflow found for latest commit)."
    exit 1
else
    echo "Error: CI check failed (status: $CI_STATUS). Fix it before deploying."
    exit 1
fi

echo "Stopping docker container"
if docker compose down; then
    echo "Containers stopped successfully"
else
    echo "Error stopping container, exiting"
    exit 1
fi

echo "Updating code from Github"
if git checkout main && git pull; then
    echo "Code updated successfully"
else
    echo "Error updating the code, exiting"
    exit 1
fi

if [ "$LIGHT_DEPLOY" = false ]; then
    echo "Rebuilding containers"
    if docker compose build --no-cache; then
        echo "Containers built successfully"
    else
        echo "Error rebuilding container, exiting"
        exit 1
    fi
else
    echo "Light deploy: skipping build"
fi


echo "Starting container in daemon mode"
if docker compose up -d; then
    DEPLOY_END=$(date +%s)
    DURATION=$((DEPLOY_END - DEPLOY_START))
    H=$((DURATION / 3600))
    M=$(( (DURATION % 3600) / 60 ))
    S=$((DURATION % 60))
    echo "Deploy completed in ${H}h ${M}m ${S}s"
    docker ps
else
    echo "Error starting container, exiting"
    exit 1
fi