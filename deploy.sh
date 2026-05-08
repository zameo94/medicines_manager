#!/bin/bash

PROJECT_DIR="project_directory_path"

echo "Deploying the last version..."

echo "Going in the project directory"
if ! cd "$PROJECT_DIR"; then
    echo "Error: Could not find directory $PROJECT_DIR"
    exit 1
fi

echo "Updating code from Github"
if git checkout main && git pull; then
    echo "Code updated sucessfully"
else
    echo "Error updating the code, exiting"
    exit 1
fi


echo "Rebuilding and starting container in demon mode"
if docker compose up -d --build; then
    echo "Deploy completd!"
    docker ps
else
    echo "Error starting container, exiting"
    exit 1
fi