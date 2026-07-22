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

LATEST_COMMIT=$(git ls-remote origin main | cut -f1)

RUN_INFO=$(gh run list --branch main --limit 1 --json headSha,conclusion,status --jq '.[0] | "\(.headSha)|\(.conclusion)|\(.status)"')
RUN_SHA=$(echo "$RUN_INFO" | cut -d'|' -f1)
RUN_CONCLUSION=$(echo "$RUN_INFO" | cut -d'|' -f2)
RUN_STATUS=$(echo "$RUN_INFO" | cut -d'|' -f3)

if [ "$RUN_SHA" != "$LATEST_COMMIT" ]; then
    echo "Error: no CI run found for latest commit ($LATEST_COMMIT)."
    exit 1
fi

if [ "$RUN_STATUS" != "completed" ]; then
    echo "Error: CI still running. Wait for it to finish before deploying."
    exit 1
fi

if [ "$RUN_CONCLUSION" = "success" ]; then
    echo "CI passed"
else
    echo "Error: CI failed (conclusion: $RUN_CONCLUSION). Fix it before deploying."
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