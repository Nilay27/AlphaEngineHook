# LearnLedger API - Curl Examples

This document provides curl command examples for using the LearnLedger API.

## User Registration and Profile

### Register a Company

```bash
curl -X 'POST' \
  'https://learn-ledger-api.vercel.app/api/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "role": "company",
  "companyName": "Blockchain Innovations Inc.",
  "companyWebsite": "https://blockchain-innovations.com"
}'
```

### Register a Freelancer

```bash
curl -X 'POST' \
  'https://learn-ledger-api.vercel.app/api/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "role": "freelancer",
  "freelancerName": "John Doe",
  "skills": ["JavaScript", "React", "Web3"]
}'
```

### Get User Profile

```bash
curl -X 'GET' \
  'https://learn-ledger-api.vercel.app/api/userProfile?walletAddress=0x742d35Cc6634C0532925a3b844Bc454e4438f44e' \
  -H 'accept: application/json'
```

### Update User Profile

> ⚠️ **Known Issue**: The PUT /userProfile endpoint currently has an issue with request body parsing. Until this is fixed on the server, please use the client-side workaround described in the [API Workarounds](./docs/api-workarounds.md) document.

```bash
curl -X 'PUT' \
  'https://learn-ledger-api.vercel.app/api/userProfile' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "role": "company",
  "companyName": "Updated Company Name",
  "companyWebsite": "https://updated-site.com"
}'
```

## Project Management

### Create a Project

> **Note**: The API implementation may have issues with field validation. If you encounter errors when creating projects despite following the documentation, please report them.

```bash
curl -X 'POST' \
  'https://learn-ledger-api.vercel.app/api/projects' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectName": "Web3 Authentication System",
  "projectDescription": "A project to build a decentralized authentication system using blockchain technology.",
  "projectLink": "https://github.com/example/web3-auth",
  "prizeAmount": 1000,
  "projectOwner": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "requiredSkills": ["JavaScript", "React", "Web3"]
}'
```

### List Projects

```bash
curl -X 'GET' \
  'https://learn-ledger-api.vercel.app/api/projects' \
  -H 'accept: application/json'
```

### Get Project Details

```bash
curl -X 'GET' \
  'https://learn-ledger-api.vercel.app/api/projects/123e4567-e89b-12d3-a456-426614174000' \
  -H 'accept: application/json'
```

### Update Project Status

```bash
curl -X 'PUT' \
  'https://learn-ledger-api.vercel.app/api/projects/123e4567-e89b-12d3-a456-426614174000/status' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "status": "in-progress",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}'
```

## Project Submissions

### Create a Submission

```bash
curl -X 'POST' \
  'https://learn-ledger-api.vercel.app/api/submissions/create' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "freelancerWallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "submissionText": "I have completed the project with all requirements.",
  "githubLink": "https://github.com/freelancer/project-submission"
}'
```

### Get Project Submissions

```bash
curl -X 'GET' \
  'https://learn-ledger-api.vercel.app/api/projects/123e4567-e89b-12d3-a456-426614174000/submissions' \
  -H 'accept: application/json'
```

### Approve a Submission

```bash
curl -X 'POST' \
  'https://learn-ledger-api.vercel.app/api/submissions/approve' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "submissionId": "123e4567-e89b-12d3-a456-426614174000",
  "companyWallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}'
``` 