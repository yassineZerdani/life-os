#!/bin/sh
set -e
echo "Waiting for PostgreSQL..."
while ! python -c "import psycopg2; psycopg2.connect(\"$DATABASE_URL\")" 2>/dev/null; do
  sleep 1
done
echo "Running migrations..."
alembic upgrade head 2>/dev/null || true
echo "Seeding data..."
python seed_data.py 2>/dev/null || true
echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
