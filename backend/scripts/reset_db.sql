-- Reset gemini database: drop and recreate with lifeos as owner.
-- Run as PostgreSQL superuser when "must be owner" errors occur:
--
--   From project root:  psql -U postgres -d postgres -f backend/scripts/reset_db.sql
--   From backend dir:   psql -U postgres -d postgres -f scripts/reset_db.sql
--
-- Then from backend/: alembic upgrade head && python seed_data.py

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'gemini' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS gemini;
CREATE DATABASE gemini OWNER lifeos;
