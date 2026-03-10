#!/bin/bash
# Reset the gemini database: drop, recreate, migrate, seed.
# Use this when alembic downgrade fails due to ownership (e.g. "must be owner of table").
#
# Requires: PostgreSQL running (Docker or local).
# Usage: ./scripts/reset_db.sh
#
# If you get "must be owner of database gemini", run as postgres superuser:
#   From backend/: RESET_DB_USER=postgres PGPASSWORD=postgres ./scripts/reset_db.sh
#   Or SQL only (from backend/): psql -U postgres -d postgres -f scripts/reset_db.sql
#   Then: alembic upgrade head && python seed_data.py

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Use RESET_DB_USER for drop/recreate if lifeos doesn't own the DB (e.g. postgres)
DB_USER="${RESET_DB_USER:-$DB_USER}"
DB_USER="${DB_USER:-lifeos}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="gemini"
export PGPASSWORD="${PGPASSWORD:-lifeos_secret}"

echo "Resetting database: $DB_NAME on $DB_HOST:$DB_PORT as $DB_USER"

# Terminate existing connections (needed to drop)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" 2>/dev/null || true

# Drop and recreate (must run as DB owner or superuser)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE $DB_NAME OWNER lifeos;"

echo "Running migrations..."
python -m alembic upgrade head

echo "Seeding data..."
python seed_data.py

echo "Done. Database reset complete."
