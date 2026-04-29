#!/bin/bash

set -e

echo "Waiting for the DB to be ready..."

until python -c "import os, psycopg2; psycopg2.connect(os.getenv('DATABASE_URL'))" > /dev/null 2>&1; do
  echo "Database still not ready - waiting..."
  sleep 2
done

echo "Database ready! Running Alembic migrations..."
alembic upgrade head

echo "Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
