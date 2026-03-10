-- Create lifeos role and gemini database for local development.
-- Run as PostgreSQL superuser: psql -d postgres -f scripts/setup_db.sql
-- Or: psql -U postgres -d postgres -f scripts/setup_db.sql

CREATE USER lifeos WITH PASSWORD 'lifeos_secret' CREATEDB;
CREATE DATABASE gemini OWNER lifeos;
GRANT ALL PRIVILEGES ON DATABASE gemini TO lifeos;
