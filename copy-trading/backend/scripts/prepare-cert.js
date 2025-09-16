#!/usr/bin/env node

/**
 * This script prepares the CA certificate for Vercel deployment.
 * It copies the certificate from /Users/sattu/Downloads/ca-certificate.crt
 * to public/certs/ directory to ensure it's included in the deployment.
 */

const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const certDir = path.join(process.cwd(), 'public', 'certs');
if (!fs.existsSync(certDir)) {
  console.log(`Creating directory: ${certDir}`);
  fs.mkdirSync(certDir, { recursive: true });
}

// Source certificate path
const sourceCertPath = path.join('/Users/sattu/Downloads/ca-certificate.crt');

// Destination certificate path
const destCertPath = path.join(certDir, 'ca-certificate.crt');

// Copy certificate if it exists
if (fs.existsSync(sourceCertPath)) {
  try {
    fs.copyFileSync(sourceCertPath, destCertPath);
    console.log(`✅ Certificate copied to: ${destCertPath}`);
  } catch (error) {
    console.error(`❌ Error copying certificate: ${error.message}`);
    process.exit(1);
  }
} else {
  // Check if certificate already exists in the destination
  if (fs.existsSync(destCertPath)) {
    console.log(`✅ Certificate already exists at: ${destCertPath}`);
  } else {
    console.warn(`⚠️ Source certificate not found at: ${sourceCertPath}`);
    console.warn('⚠️ The application will fall back to insecure connection mode');
  }
}

console.log('Certificate preparation complete'); 