import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  throw new Error("DATABASE_URL environment variable is required");
}

// Set TLS rejection variables if SSL validation is disabled
if (process.env.DISABLE_SSL_VALIDATION === 'true') {
  console.warn("⚠️ SSL certificate validation disabled - setting TLS rejection overrides");
  // These are needed for some environments where the regular SSL options aren't enough
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  process.env.PG_TLS_REJECT_UNAUTHORIZED = '0';
}

// Log all environment variables (without leaking secrets)
console.log(`[DB Setup] Environment: ${process.env.NODE_ENV || 'unknown'}`);
console.log(`[DB Setup] DISABLE_SSL_VALIDATION: ${process.env.DISABLE_SSL_VALIDATION || 'not set'}`);
console.log(`[DB Setup] NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'not set'}`);
console.log(`[DB Setup] DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
console.log(`[DB Setup] Current working directory: ${process.cwd()}`);

// Function to get CA certificate based on environment
function getCACertificate() {
  // If SSL validation is explicitly disabled via env var, don't bother with certificate
  if (process.env.DISABLE_SSL_VALIDATION === 'true') {
    console.warn("⚠️ SSL certificate validation disabled via environment variable");
    return undefined;
  }

  try {
    // For production (Vercel), try multiple possible locations
    if (process.env.NODE_ENV === 'production') {
      // Try standard paths for Vercel deployments
      const possiblePaths = [
        path.join(process.cwd(), 'public/certs/ca-certificate.crt'),
        path.join(process.cwd(), '.vercel/output/static/certs/ca-certificate.crt'),
        path.join(process.cwd(), 'certs/ca-certificate.crt'),
        path.join('/tmp/certs/ca-certificate.crt')
      ];
      
      console.log(`[DB Setup] Searching for certificate in production mode`);
      for (const certPath of possiblePaths) {
        console.log(`[DB Setup] Checking for certificate at: ${certPath}`);
        if (fs.existsSync(certPath)) {
          console.log(`✅ Found CA certificate at: ${certPath}`);
          return fs.readFileSync(certPath).toString();
        }
      }
      
      console.warn("⚠️ Could not find CA certificate in Vercel environment");
      // List all files in the cwd to help with debugging
      try {
        console.log(`[DB Setup] Files in ${process.cwd()}: ${fs.readdirSync(process.cwd()).join(', ')}`);
        if (fs.existsSync(path.join(process.cwd(), 'public'))) {
          console.log(`[DB Setup] Files in public: ${fs.readdirSync(path.join(process.cwd(), 'public')).join(', ')}`);
        }
      } catch (error) {
        console.error(`[DB Setup] Error listing files:`, error);
      }
    } else {
      // For local development, try to use the certificate from the downloads directory
      const devCertPath = '/Users/sattu/Downloads/ca-certificate.crt';
      console.log(`[DB Setup] Checking for certificate at: ${devCertPath}`);
      if (fs.existsSync(devCertPath)) {
        console.log(`✅ Found CA certificate at: ${devCertPath}`);
        return fs.readFileSync(devCertPath).toString();
      }
    }
    
    // If certificate not found, log it and fall back to disabling TLS validation
    console.warn("⚠️ CA Certificate not found, falling back to insecure connection");
    return undefined;
  } catch (error) {
    console.error("❌ Error reading CA certificate:", error);
    return undefined;
  }
}

// Get CA certificate
const caCert = getCACertificate();

// Configure SSL options based on environment and certificate availability
// For local development, disable SSL completely
// Also check if the database URL is a local database (localhost or 127.0.0.1)
const isLocalDB = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
const sslConfig = process.env.NODE_ENV === 'development' || process.env.DISABLE_SSL_VALIDATION === 'true' || isLocalDB
  ? false  // Disable SSL completely for local PostgreSQL
  : caCert
    ? {
        ca: caCert,
        // Still keep rejectUnauthorized true when using a CA cert
        rejectUnauthorized: true
      }
    : {
        // Fall back to this when no cert is available
        rejectUnauthorized: false
      };

console.log(`[DB Setup] SSL Config: ${JSON.stringify({ 
  rejectUnauthorized: sslConfig.rejectUnauthorized,
  hasCert: !!caCert
})}`);

// Fix for the connection string - handle SSL mode
let connectionString = process.env.DATABASE_URL;

// If SSL validation is disabled, modify the connection string to not enforce SSL
if (process.env.DISABLE_SSL_VALIDATION === 'true') {
  // Replace sslmode=require with sslmode=prefer or remove it
  if (connectionString.includes('sslmode=require')) {
    connectionString = connectionString.replace('sslmode=require', 'sslmode=prefer');
    console.log(`[DB Setup] Modified connection string SSL mode to 'prefer'`);
  }
}

// Create connection pool with SSL for DigitalOcean PostgreSQL
const pool = new Pool({
  connectionString,
  // Set connection timeout and retry options
  connectionTimeoutMillis: 5000, // 5 second timeout
  max: 10, // Maximum 10 clients in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  ssl: sslConfig
});

// Test database connection on start
pool.connect()
  .then(client => {
    console.log('✅ Successfully connected to DigitalOcean PostgreSQL database');
    console.log(`✅ SSL configuration: ${caCert ? 'Using CA certificate' : 'Certificate validation disabled'}`);
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('❌ Error details:', err);
    
    // Additional handling for specific error codes
    if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      console.error('This is a self-signed certificate error. Try setting DISABLE_SSL_VALIDATION=true in environment variables.');
    }
    
    // We don't throw here to allow the app to start, but the error will be logged
  });

// Export drizzle instance with pool
export const db = drizzle(pool, { logger: true });