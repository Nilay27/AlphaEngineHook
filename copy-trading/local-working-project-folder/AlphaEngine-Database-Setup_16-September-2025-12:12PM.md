# AlphaEngine Database Setup Guide

**Created**: 16-September-2025-12:12PM IST

## CHANGELOG
- **16-Sep-2025 12:12PM IST**: Initial creation with PostgreSQL setup and migration guide

## Overview

This document provides complete database setup and management instructions for AlphaEngine, including PostgreSQL configuration, schema management, and migration procedures.

## PostgreSQL Configuration

### Database Details
- **Database Name**: `alphaengine`
- **Connection**: PostgreSQL 14.19 (Homebrew) on localhost:5432
- **Environment**: `DATABASE_URL="postgresql://consentsam@localhost:5432/alphaengine"`
- **IMPORTANT**: DO NOT use any other database (SQLite, MySQL, etc.) - This project is configured specifically for PostgreSQL

### Initial Setup

#### 1. Install PostgreSQL (if not installed)
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### 2. Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create alphaengine database
CREATE DATABASE alphaengine;

# Grant permissions (if needed)
GRANT ALL PRIVILEGES ON DATABASE alphaengine TO consentsam;

# Exit psql
\q
```

#### 3. Verify Connection
```bash
# Test connection
psql postgresql://consentsam@localhost:5432/alphaengine

# Should connect successfully
\q
```

## Schema Management

### Schema Location
- **Path**: `backend/db/schema/` directory
- **Format**: Drizzle ORM schema definitions
- **Files**: All table definitions are in this directory

### Apply Schema Changes
```bash
# Navigate to backend directory
cd backend

# Apply schema changes to database
bun run db:push

# This command:
# - Reads schema files from backend/db/schema/
# - Compares with current database state
# - Applies necessary changes
# - Updates database to match schema definitions
```

### Schema Development Workflow

#### 1. Modify Schema Files
```bash
# Edit schema files in backend/db/schema/
# Example: backend/db/schema/users.ts
```

#### 2. Apply Changes
```bash
cd backend
bun run db:push
```

#### 3. Verify Changes
```bash
# Connect to database and verify
psql postgresql://consentsam@localhost:5432/alphaengine
\dt  # List tables
\d table_name  # Describe specific table
```

## Migration Best Practices

### Clean Slate Approach
- **No data migration needed** - This is a clean slate implementation
- **Drop and recreate** - Safe to drop existing LearnLedger database
- **Fresh schema** - Create AlphaEngine schema from scratch

### Schema Changes Process

#### For New Tables
1. Add new schema file in `backend/db/schema/`
2. Run `bun run db:push`
3. Verify table creation

#### For Table Modifications
1. Edit existing schema file
2. Run `bun run db:push`
3. Drizzle will handle column additions/modifications
4. **Warning**: Dropping columns will lose data

#### For Data Preservation (if needed)
```bash
# Backup specific data before schema changes
pg_dump -U consentsam -h localhost -p 5432 -t table_name alphaengine > backup.sql

# Apply schema changes
bun run db:push

# Restore data if compatible
psql -U consentsam -h localhost -p 5432 alphaengine < backup.sql
```

## Common Database Operations

### Reset Database (Clean Slate)
```bash
# Drop and recreate database
psql postgres
DROP DATABASE alphaengine;
CREATE DATABASE alphaengine;
\q

# Apply fresh schema
cd backend
bun run db:push
```

### Check Database Status
```bash
# Connect to database
psql postgresql://consentsam@localhost:5432/alphaengine

# List all tables
\dt

# Check table structure
\d table_name

# View data
SELECT * FROM table_name LIMIT 5;
```

### Environment Configuration

#### Backend Environment Variables
```env
# .env file in backend directory
DATABASE_URL="postgresql://consentsam@localhost:5432/alphaengine"
NODE_ENV=development
LOG_LEVEL=debug
```

#### Connection Testing
```bash
# Test connection from backend
cd backend
bun run db:check  # If available, or test with simple query
```

## Troubleshooting

### Connection Issues
```bash
# Check PostgreSQL service
brew services list | grep postgresql

# Start PostgreSQL if stopped
brew services start postgresql@14

# Check port availability
lsof -i :5432
```

### Permission Issues
```bash
# Grant all privileges to user
psql postgres
GRANT ALL PRIVILEGES ON DATABASE alphaengine TO consentsam;
GRANT ALL ON SCHEMA public TO consentsam;
```

### Schema Push Failures
```bash
# Check for conflicts
cd backend
bun run db:push --verbose

# Force schema reset (WARNING: loses data)
# 1. Backup important data first
# 2. Drop all tables
# 3. Run db:push again
```

## Database Monitoring

### Performance Monitoring
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'alphaengine';

-- Check table sizes
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Log Monitoring
```bash
# PostgreSQL logs location (Homebrew)
tail -f /opt/homebrew/var/log/postgresql@14.log
```

## Integration with AlphaEngine

### Schema Design Principles
- **User-centric**: Focus on alpha generators and consumers
- **Strategy-based**: Core entities around trading strategies
- **Real-time ready**: Schema supports live data streaming
- **Scalable**: Design for growth and performance

### Key Tables (Reference)
- Users (alpha generators/consumers)
- Strategies (trading strategies)
- Subscriptions (consumer-strategy relationships)
- Trades (executed trades)
- Performance metrics
- Notifications

### Development Guidelines
1. **Always use transactions** for multi-table operations
2. **Index frequently queried columns** (user_id, strategy_id, timestamps)
3. **Use meaningful constraints** (foreign keys, check constraints)
4. **Document schema changes** in this file's CHANGELOG
5. **Test migrations** on development data before production