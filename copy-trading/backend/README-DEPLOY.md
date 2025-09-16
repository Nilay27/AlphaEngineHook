# Vercel Deployment Guide

This guide explains how to deploy the LearnLedger application to Vercel with proper SSL configuration for the DigitalOcean database.

## Prerequisites

1. A Vercel account
2. Git repository for your project
3. DigitalOcean PostgreSQL database connection string

## Deployment Steps

### 1. SSL Configuration

This application supports two approaches for handling DigitalOcean's self-signed certificates:

#### Option A: Using the Environment Variable (Recommended)

The simplest solution is to set the `DISABLE_SSL_VALIDATION` environment variable to `true`. This has already been configured in `vercel.json`.

#### Option B: Using CA Certificate

Alternatively, you can use a CA certificate:

```bash
# Run the certificate preparation script
npm run prepare-cert
```

This script will copy the certificate to `public/certs/`.

### 2. Deploy to Vercel

You can deploy to Vercel in several ways:

#### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Log in to Vercel if not already logged in
vercel login

# Deploy to production
vercel --prod
```

When prompted:
- Set up and deploy project? `Y`
- Select scope: Choose your account
- Link to existing project? If you've deployed before, select `Y` and choose the project
- Override settings? `N` (unless you need to change something)

#### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Follow the Vercel deployment steps

### 3. Configure Environment Variables

Make sure to set these environment variables in the Vercel dashboard:

- `DATABASE_URL`: Your DigitalOcean PostgreSQL connection string
- Other environment variables as needed

You can set environment variables via the CLI:

```bash
vercel env add DATABASE_URL
```

Or through the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables

### 4. Verify Deployment

After deployment, check the function logs in Vercel to ensure:

1. The database connection is successful
2. SSL configuration is correctly set up

Look for these log messages:
```
[DB Setup] Modified connection string SSL mode to 'prefer'
✅ Successfully connected to DigitalOcean PostgreSQL database
✅ SSL configuration: Certificate validation disabled
```

You can view logs in the Vercel dashboard or via CLI:
```bash
vercel logs your-project-name.vercel.app
```

## Troubleshooting

If you encounter SSL/TLS issues:

1. First, verify the `DISABLE_SSL_VALIDATION` environment variable is set to `true` in vercel.json
2. If that doesn't work, try modifying your DATABASE_URL to use `sslmode=prefer` instead of `sslmode=require`
3. If all else fails, create a new environment variable in Vercel called `PG_TLS_REJECT_UNAUTHORIZED` and set it to `0`

### Quick Fix for SSL Issues

If you continue to experience SSL certificate issues, use these additional measures:

1. Add extra environment variables in the Vercel dashboard:
   - Name: `PG_TLS_REJECT_UNAUTHORIZED`
   - Value: `0`
   - Name: `NODE_TLS_REJECT_UNAUTHORIZED`
   - Value: `0`

2. Redeploy your application:
   ```bash
   vercel --prod
   ``` 