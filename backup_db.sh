#!/bin/bash

### NEEDED VARIABLES ###
## FROM BACKUP.CONF
# ENV_PATH
# BACKUP_DIR
## FROM .ENV
# DB_USER
# DB_NAME
# DB_PASSWORD
###

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
CONTAINER_PATH="/tmp/medicines_backup.sql"
HOST_PATH="$BACKUP_DIR/backup_${TIMESTAMP}.sql"
CONFIG_FILE="backup.conf"

echo "Chekcing deploy.conf file"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: $CONFIG_FILE not found."
    echo "Please copy 'deploy.conf.example' to '$CONFIG_FILE' and set your variables."
    exit 1
fi

echo "Chekcing .env file"

if [ -f "$ENV_PATH" ]; then
    export $(grep -v '^#' "$ENV_PATH" | xargs)
    echo "Environment variables loaded from $ENV_PATH"
else
    echo ".env file not found at $ENV_PATH"
    exit 1
fi

echo "Starting DB backup..."

if [ ! -d "$BACKUP_DIR" ]; then
    echo "The directory backup doesn't exist. Creating it..."
    mkdir $BACKUP_DIR
fi

echo "Chekcing if Postgre is running"

if docker exec medicines_db pg_isready -U "$DB_USER" > /dev/null 2>&1; then
    echo "Postgre's up"
else
    echo "Postgre's down, exiting."
    exit 1
fi

echo "Chekcing if DB exists"

CHECK_COMMAND="SELECT 1 FROM pg_database WHERE datname='"$DB_NAME"';"
RESULT=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d postgres -tAc "$CHECK_COMMAND")

if [ "$RESULT" = "1" ]; then
    echo "DB exists"
else
    echo "DB doesn't exist, exiting."
    exit 1
fi

echo "Creating backup"

echo "1. Executing backup inside container..."
if docker exec -e PGPASSWORD="$DB_PASSWORD" medicines_db \
  pg_dump -U "$DB_USER" -f "$CONTAINER_PATH" "$DB_NAME"; then

    echo "2. Copying file to system..."
    docker cp medicines_db:"$CONTAINER_PATH" "$HOST_PATH"

    echo "3. Deleting file from container..."
    docker exec medicines_db rm "$CONTAINER_PATH"

    echo "Done! Backup is at $HOST_PATH"
else
    echo "Error creating the backup, exiting"
    exit 1
fi

find "$BACKUP_DIR" -type f -name "backup_*.sql" -mtime +30 -delete
echo "Old backups (30+ days) cleaned up."
