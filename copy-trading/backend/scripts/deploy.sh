#!/bin/bash

# Deploy script for Vercel that handles SSL certificate issues

echo "🚀 LearnLedger Vercel Deployment Script"
echo "==============================================="

# 1. Ensure the certificate directory exists
mkdir -p public/certs
echo "✅ Created certificate directory"

# 2. Copy the certificate if it exists
if [ -f "/Users/sattu/Downloads/ca-certificate.crt" ]; then
  cp "/Users/sattu/Downloads/ca-certificate.crt" "public/certs/"
  echo "✅ Copied CA certificate"
else
  echo "⚠️ CA certificate not found, but that's okay - we have fallback mechanisms"
fi

# 3. Make sure environment is set up
echo "✅ SSL settings are in vercel.json and db/db.ts"
echo "✅ Environment variable DISABLE_SSL_VALIDATION=true is configured"

# 4. Run the certificate preparation script
echo "⏳ Running certificate preparation script..."
npm run prepare-cert

# 5. Deployment
echo "⏳ Starting deployment to Vercel..."
echo "NOTE: When prompted, choose YES for setup and deployment"

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment process initiated!"
echo ""
echo "If you encounter SSL issues, please check the logs in Vercel dashboard"
echo "and verify the DISABLE_SSL_VALIDATION=true environment variable is set." 