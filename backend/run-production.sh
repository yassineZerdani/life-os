#!/bin/sh
# Production: run with gunicorn + uvicorn workers (recommended on OVH Ubuntu)
set -e
export PORT="${PORT:-8000}"
exec gunicorn app.main:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:${PORT}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
