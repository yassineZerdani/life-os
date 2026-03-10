-- Grant lifeos permission to access all tables in gemini.
-- Run as superuser: psql -d gemini -f scripts/grant_permissions.sql

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lifeos;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lifeos;
GRANT USAGE, CREATE ON SCHEMA public TO lifeos;
