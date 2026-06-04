-- Initialize NexMart database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search optimization

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nexmart_db TO nexmart;
