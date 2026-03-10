#!/bin/bash
# Create lifeos role and gemini database for local development.
# Run: ./scripts/setup_local_db.sh
# Requires: PostgreSQL running locally, and a superuser (e.g. postgres or your username)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "Creating lifeos role and gemini database..."
psql -d postgres -f scripts/setup_db.sql

echo "Done. Start the backend with: uvicorn app.main:app --reload --port 8000"
