#!/bin/bash

### NEEDED VARIABLES ###
## FROM DEPLOY.CONF
# PROJECT_DIR
###

LIGHT_DEPLOY=false

if [ "$1" = "--light" ]; then
    LIGHT_DEPLOY=true
fi

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
    echo "Deploy completed!"
    docker ps
else
    echo "Error starting container, exiting"
    exit 1
fi