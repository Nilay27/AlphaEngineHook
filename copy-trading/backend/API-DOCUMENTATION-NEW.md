# LearnLedger API Documentation

This documentation provides comprehensive details about all the APIs available in the LearnLedger platform. It includes information about request/response formats, error codes, and example usage for frontend developers.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Response Format](#common-response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Register](#register)
   - [User Profile](#user-profile)
   - [Projects](#projects)
   - [Submissions](#submissions)
   - [Company](#company)
   - [Freelancer](#freelancer)
6. [Interactive API Documentation](#interactive-api-documentation)
7. [Testing the API](#testing-the-api)

## Overview

The LearnLedger API follows RESTful principles and uses standard HTTP methods:

- `GET`: Retrieve resources
- `POST`: Create new resources
- `PUT`: Update resources
- `PATCH`: Partially update resources
- `DELETE`: Remove resources

Base URLs:
- Production: `https://LearnLedger.vercel.app/api`
- Development: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication using Metamask wallet addresses. To authenticate:

1. Connect your Metamask wallet
2. Include your wallet address in the request body or parameters as needed
3. For protected endpoints, the API will verify that the wallet address matches the authorized user

## Common Response Format

All API responses follow a consistent format:

```json
{
  "isSuccess": true|false,
  "message": "Human-readable message",
  "data": {...} | [...] | null
}
```

- `isSuccess`: Boolean indicating if the request was successful
- `message`: Optional human-readable message describing the result
- `data`: Optional data payload (object, array, or null)

## Error Handling

When errors occur, responses follow this format:

```json
{
  "isSuccess": false,
  "message": "Error message",
  "errors": {
    "fieldName": ["Error message for this field"]
  }
}
```

Common HTTP status codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request (missing parameters, validation errors)
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## API Endpoints

### Register

#### Register a new user

```
POST /api/register
```

Creates a new user profile (either company or freelancer).

**Request Body:**

```json
{
  "walletAddress": "0x...",
  "role": "company|freelancer",
  "companyName": "Company Name", // if role is company
  "companyWebsite": "https://example.com", // if role is company
  "freelancerName": "Full Name", // if role is freelancer
  "skills": ["JavaScript", "React", "Web3"] // if role is freelancer
}
```

**Response:**

```json
{
  "isSuccess": true,
  "message": "Successfully registered profile",
  "data": {
    "id": "uuid",
    "walletAddress": "0x...",
    "role": "company|freelancer",
    // Other fields depending on role
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Missing required fields
- `400 Bad Request`: Invalid wallet address format
- `409 Conflict`: User already registered
- `500 Internal Server Error`: Database or server error

### User Profile

#### Get User Profile

```
GET /api/userProfile?walletAddress=0x...
```

Retrieves user profile information (for either company or freelancer).

**Query Parameters:**
- `walletAddress`: The Ethereum wallet address

**Response:**

```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "walletAddress": "0x...",
    "role": "company|freelancer",
    // Other profile fields depending on role
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Missing wallet address
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database or server error

#### Update User Profile

```
PUT /api/userProfile
```

Updates user profile information.

**Request Body:**

```json
{
  "walletAddress": "0x...",
  "role": "company|freelancer",
  // Other fields to update depending on role
}
```

**Response:**

```json
{
  "isSuccess": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated profile data
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Missing wallet address
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database or server error

### Projects

#### List Projects

```
GET /api/projects
```

Returns a list of projects, with optional filtering.

**Query Parameters:**
- `status`: Filter by project status (open, closed, etc.)
- `skill`: Filter by required skill
- `minPrize`: Minimum prize amount
- `maxPrize`: Maximum prize amount
- `owner`: Filter by project owner wallet
- `sort`: Sort field (created, prize, name)
- `order`: Sort order (asc, desc)
- `limit`: Limit number of results (default 20, max 100)
- `offset`: Pagination offset

**Response:**

```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "uuid",
      "projectName": "Project Name",
      "projectDescription": "Description text",
      "prizeAmount": 1000,
      "projectStatus": "open",
      "projectOwner": "0x...",
      "requiredSkills": "JavaScript, React",
      "completionSkills": "Web3, Solidity",
      "assignedFreelancer": null,
      "projectRepo": "https://github.com/example/repo",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    },
    // More projects...
  ]
}
```

**Possible Errors:**
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Database or server error

#### Create Project

```
POST /api/projects
```

Creates a new project.

> **Note**: The API implementation may have issues with field validation. If you encounter errors when creating projects despite following the documentation, please report them.

**Request Body:**

```json
{
  "projectName": "Project Name",
  "projectDescription": "Description text",
  "projectLink": "https://github.com/example/repo",
  "prizeAmount": 1000,
  "projectOwner": "0x...",
  "requiredSkills": ["JavaScript", "React"]
}
```

**Response:**

```json
{
  "isSuccess": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "projectName": "Project Name",
    // Other project fields
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Missing required fields
- `400 Bad Request`: Invalid wallet address format
- `400 Bad Request`: Project owner does not have a registered profile
- `500 Internal Server Error`: Database or server error

#### Get Project Details

```
GET /api/projects/{projectId}
```

Retrieves detailed information about a specific project.

**Path Parameters:**
- `projectId`: UUID of the project

**Response:**

```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "projectName": "Project Name",
    "projectDescription": "Description text",
    "prizeAmount": 1000,
    "projectStatus": "open",
    "projectOwner": "0x...",
    "requiredSkills": "JavaScript, React",
    "completionSkills": "Web3, Solidity",
    "assignedFreelancer": null,
    "projectRepo": "https://github.com/example/repo",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z",
    "companyId": "uuid",
    "companyName": "Company Name"
  }
}
```

**Possible Errors:**
- `404 Not Found`: Project not found
- `500 Internal Server Error`: Database or server error

#### Update Project

```
PUT /api/projects/{projectId}
```

Updates a specific project.

**Path Parameters:**
- `projectId`: UUID of the project

**Request Body:**

```json
{
  "projectName": "Updated Project Name",
  "projectDescription": "Updated description",
  // Other fields to update
}
```

**Response:**

```json
{
  "isSuccess": true,
  "message": "Project updated successfully",
  "data": {
    // Updated project data
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Project not found
- `403 Forbidden`: Not authorized to update this project
- `500 Internal Server Error`: Database or server error

#### Delete Project

```
DELETE /api/projects/{projectId}
```

Deletes a specific project.

**Path Parameters:**
- `projectId`: UUID of the project

**Response:**

```json
{
  "isSuccess": true,
  "message": "Project deleted successfully"
}
```

**Possible Errors:**
- `404 Not Found`: Project not found
- `403 Forbidden`: Not authorized to delete this project
- `500 Internal Server Error`: Database or server error

### Submissions

#### Create Submission

```
POST /api/submissions/create
```

Creates a new project submission.

**Request Body:**

```json
{
  "projectId": "uuid",
  "freelancerWallet": "0x...",
  "submissionText": "Submission description",
  "githubLink": "https://github.com/example/submission"
}
```

**Response:**

```json
{
  "isSuccess": true,
  "message": "Submission created successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "freelancerWallet": "0x...",
    "submissionText": "Submission description",
    "githubLink": "https://github.com/example/submission",
    "status": "pending",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Project not found
- `403 Forbidden`: Not authorized to submit to this project
- `500 Internal Server Error`: Database or server error

#### Get Submissions

```
GET /api/submissions/read?projectId={projectId}
```

Retrieves submissions for a specific project.

**Query Parameters:**
- `projectId`: UUID of the project

**Response:**

```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "freelancerWallet": "0x...",
      "submissionText": "Submission description",
      "githubLink": "https://github.com/example/submission",
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00Z",
      "freelancerName": "Freelancer Name"
    },
    // More submissions...
  ]
}
```

**Possible Errors:**
- `400 Bad Request`: Missing project ID
- `404 Not Found`: Project not found
- `403 Forbidden`: Not authorized to view these submissions
- `500 Internal Server Error`: Database or server error

#### Approve Submission

```
POST /api/submissions/approve
```

Approves a project submission.

**Request Body:**

```json
{
  "submissionId": "uuid",
  "companyWallet": "0x..."
}
```

**Response:**

```json
{
  "isSuccess": true,
  "message": "Submission approved successfully",
  "data": {
    "id": "uuid",
    "status": "approved",
    // Other submission details
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Submission not found
- `403 Forbidden`: Not authorized to approve this submission
- `500 Internal Server Error`: Database or server error

#### Delete Submission

```
DELETE /api/submissions/delete?submissionId={submissionId}&walletAddress={walletAddress}
```

Deletes a project submission.

**Query Parameters:**
- `submissionId`: UUID of the submission
- `walletAddress`: Wallet address of the requester

**Response:**

```json
{
  "isSuccess": true,
  "message": "Submission deleted successfully"
}
```

**Possible Errors:**
- `400 Bad Request`: Missing required parameters
- `404 Not Found`: Submission not found
- `403 Forbidden`: Not authorized to delete this submission
- `500 Internal Server Error`: Database or server error

### Company

#### Get Company Details

```
GET /api/company/{companyId}
```

Retrieves detailed information about a specific company.

**Path Parameters:**
- `companyId`: UUID of the company

**Response:**

```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "companyName": "Company Name",
    "walletAddress": "0x...",
    "companyWebsite": "https://example.com",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

**Possible Errors:**
- `404 Not Found`: Company not found
- `500 Internal Server Error`: Database or server error

### Freelancer

#### Get Freelancer Details

```
GET /api/freelancer/{freelancerId}
```

Retrieves detailed information about a specific freelancer.

**Path Parameters:**
- `freelancerId`: UUID of the freelancer

**Response:**

```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "name": "Freelancer Name",
    "walletAddress": "0x...",
    "skills": "JavaScript, React, Web3",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

**Possible Errors:**
- `404 Not Found`: Freelancer not found
- `500 Internal Server Error`: Database or server error

## Interactive API Documentation

For an interactive experience, you can access the Swagger UI documentation at:

```
/api/docs
```

This interface allows you to:
- Browse all available endpoints
- View request/response schemas
- Test API calls directly from the browser
- See all possible response codes and error messages

## Testing the API

To test the API endpoints:

1. Ensure you have a wallet address (from Metamask)
2. Register a profile (company or freelancer)
3. Use the API endpoints as documented above
4. Check response status and body for success/error information

For development, you can use tools like:
- Swagger UI (built-in at `/api/docs`)
- Postman
- cURL
- Fetch API in the browser console

When making requests that require authentication, always include your wallet address in the appropriate field.