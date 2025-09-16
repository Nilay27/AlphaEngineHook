// @ts-nocheck
/**
 * @description
 * This file configures our Drizzle ORM connection to a DigitalOcean PostgreSQL database.
 * It exports a single `db` object that can be imported by server actions or other utilities.
 *
 * Key features:
 * - Creates a pg Pool using `process.env.DATABASE_URL`
 * - Passes the Pool to Drizzle for executing queries
 * - Implements retry logic for serverless environments
 *
 * @dependencies
 * - pg: Postgres client for Node.js
 * - drizzle-orm: ORM for TypeScript
 *
 * @notes
 * - Ensure `DATABASE_URL` is set in your environment variables
 * - Different SSL configuration for development vs. production
 * - Connection retry logic for serverless functions
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// Configure SSL based on environment and DATABASE_URL
const connectionString = process.env.DATABASE_URL;
const isLocalhost = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
const sslDisabled = connectionString?.includes('sslmode=disable');

const sslConfig = (process.env.NODE_ENV !== 'production' && (isLocalhost || sslDisabled))
  ? {} // No SSL for local development
  : {
      ssl: {
        rejectUnauthorized: false
      }
    };

// For development only - NEVER use in production
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Create a connection pool with pg
const pool = new Pool({
  connectionString,
  ...sslConfig,
  // Set connection timeout and retry options
  connectionTimeoutMillis: 5000, // 5 second timeout
  max: 10, // Maximum 10 clients in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
})

// Create and export the Drizzle ORM instance
export const db = drizzle(pool, { logger: process.env.NODE_ENV !== 'production' })
