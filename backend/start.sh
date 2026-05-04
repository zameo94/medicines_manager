#!/bin/bash

set -e

DB_NAME=$(echo $DATABASE_URL | rev | cut -d/ -f1 | rev)
DB_BASE_URL=$(echo $DATABASE_URL | sed "s/\/$DB_NAME//")

echo "Waiting for PostgreSQL to be ready..."
until python -c "import os, psycopg2; psycopg2.connect('$DB_BASE_URL/postgres')" > /dev/null 2>&1; do
  echo "PostgreSQL still not ready - waiting..."
  sleep 2
done

echo "PostgreSQL is up. Checking if database '$DB_NAME' exists..."
python << END
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

conn_url = "$DB_BASE_URL/postgres"
db_name = "$DB_NAME"

try:
    conn = psycopg2.connect(conn_url)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
    exists = cur.fetchone()
    
    if not exists:
        print(f"Database '{db_name}' does not exist. Creating...")
        cur.execute(f'CREATE DATABASE "{db_name}"')
    else:
        print(f"Database '{db_name}' already exists.")
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error checking/creating database: {e}")
    exit(1)
END

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
