# API Documentation Update Report

Generated on: 3/10/2025, 4:14:08 PM

## Success Responses Updated

### POST /register (company)

Role: company

- Status Code: 200
  - Captured successful response
  - Response Keys: isSuccess, message, data

### POST /register (freelancer)

Role: freelancer

- Status Code: 200
  - Captured successful response
  - Response Keys: isSuccess, message, data

### GET /userProfile (company)

Role: company

- Status Code: 200
  - Captured successful response
  - Response Keys: isSuccess, data

### GET /userProfile (freelancer)

Role: freelancer

- Status Code: 200
  - Captured successful response
  - Response Keys: isSuccess, data

### GET /projects

- Status Code: 200
  - Captured successful response
  - Response Keys: isSuccess, data

## Error Responses Updated

### POST /register (company)

Role: company

- Status Code: 409
  - Captured error response: Company profile with this wallet address already exists
  - Response Keys: isSuccess, message, errors

- Status Code: 400
  - Captured error response: Validation failed
  - Response Keys: isSuccess, message, errors

### POST /register (freelancer)

Role: freelancer

- Status Code: 409
  - Captured error response: Freelancer profile with this wallet address already exists
  - Response Keys: isSuccess, message, errors

- Status Code: 400
  - Captured error response: Validation failed
  - Response Keys: isSuccess, message, errors

### GET /userProfile

- Status Code: 400
  - Captured error response: Missing required query parameters: wallet and role
  - Response Keys: isSuccess, message

### GET /projects/{projectId}

- Status Code: 404
  - Captured error response: Project not found
  - Response Keys: isSuccess, message

## Summary

- Total success endpoints updated: 5
- Total error endpoints updated: 4
