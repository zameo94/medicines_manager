#!/bin/bash

CONFIG_FILE="deploy.conf"

echo "Deploying the last version..."

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: $CONFIG_FILE not found."
    echo "Please copy 'deploy.conf.example' to '$CONFIG_FILE' and set your variables."
    exit 1
fi

echo "Going in the project directory"
if ! cd "$PROJECT_DIR"; then
    echo "Error: Could not find directory $PROJECT_DIR"
    exit 1
fi

echo "Stopping docker container"
if docker compose down; then
    echo "Containers stopped sucessfully"
else
    echo "Error stopping container, exiting"
    exit 1
fi

echo "Updating code from Github"
if git checkout main && git pull; then
    echo "Code updated sucessfully"
else
    echo "Error updating the code, exiting"
    exit 1
fi

echo "Rebuilding containers"
if docker compose build --no-cache; then
    echo "Containers builded sucessfully"
else
    echo "Error rebuilding container, exiting"
    exit 1
fi


echo "Starting container in demon mode"
if docker compose up -d; then
    echo "Deploy completd!"
    docker ps
else
    echo "Error starting container, exiting"
    exit 1
fi