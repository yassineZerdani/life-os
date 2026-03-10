#!/bin/sh
# Docker production: wait for DB, migrate, seed, then gunicorn
set -e
echo "Waiting for PostgreSQL..."
while ! python -c "import psycopg2; psycopg2.connect(\"$DATABASE_URL\")" 2>/dev/null; do
  sleep 1
done
echo "Running migrations..."
alembic upgrade head 2>/dev/null || true
echo "Seeding data..."
python seed_data.py 2>/dev/null || true
echo "Starting gunicorn..."
exec gunicorn app.main:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:${PORT:-8000}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
