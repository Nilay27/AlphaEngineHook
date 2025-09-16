#!/bin/bash

# Deployment script for Vercel with CORS fixes

echo "🚀 LearnLedger Vercel Deployment Script (with CORS fixes)"
echo "==============================================="

# Run the fix script to ensure all CORS issues are resolved
echo "⏳ Running CORS fix script..."
node scripts/fix-cors-handlers.js

# Run the certificate preparation script
echo "⏳ Running certificate preparation script..."
npm run prepare-cert

# Verify build locally first
echo "⏳ Verifying build locally..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Please fix the errors before deploying."
  exit 1
else
  echo "✅ Build verified successfully!"
fi

# Deployment
echo "⏳ Starting deployment to Vercel..."
echo "NOTE: When prompted, choose YES for setup and deployment"

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment process initiated!"
echo ""
echo "If you encounter SSL issues, please check the logs in Vercel dashboard"
echo "and verify the DISABLE_SSL_VALIDATION=true environment variable is set." 