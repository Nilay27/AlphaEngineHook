# API Documentation Validation Report

Generated on: 3/10/2025, 3:40:01 PM

## POST /register

Operation ID: `registerUser`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data, errors
Extra keys in actual response not in expected response: debugInfo


#### Expected Response
```json
{
  "isSuccess": false,
  "message": "Freelancer profile with this wallet address already exists",
  "data": null,
  "errors": {
    "walletAddress": [
      "This wallet address is already registered with a profile"
    ]
  }
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Failed to create user profile record.",
  "debugInfo": {
    "message": "Failed to create user profile record.",
    "name": "Error",
    "stack": "Error: Failed to create user profile record.\n    at /var/task/.next/server/app/api/register/route.js:1:4475\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)",
    "dbURL": "postgresql://doadmin:****@learn-ledger-do-user-19783146-0.m.db.ondigitalocean.com:25061/learn-ledger-pool?sslmode=require",
    "env": "production",
    "vercelEnv": "production",
    "error": {
      "message": "Cannot read properties of undefined (reading 'toLowerCase')",
      "code": "UNKNOWN",
      "stack": "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at d (/var/task/.next/server/chunks/2762.js:1:4822)\n    at /var/task/.next/server/app/api/register/route.js:1:3231\n    at /var/task/.next/server/app/api/register/route.js:1:2466\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async /var/task/.next/server/chunks/2762.js:1:13561\n    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411\n    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)\n    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)\n    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25516)\n    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)"
    }
  }
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 409 Response

⚠️ Manual testing required for 409 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /userProfile

Operation ID: `getUserProfile`

### Results

✅ **Success**

Response structure matches expected format

#### Expected Response
```json
{
  "isSuccess": true,
  "data": {
    "id": "9f3d59a8-b899-4971-9ac2-04cb5aa30fcc",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    "companyName": "Blockchain Innovations Inc.",
    "shortDescription": "",
    "logoUrl": "",
    "createdAt": "2025-03-10T07:19:03.882Z",
    "updatedAt": "2025-03-10T07:19:03.882Z"
  }
}
```

#### Actual Response
```json
{
  "isSuccess": true,
  "data": {
    "id": "9f3d59a8-b899-4971-9ac2-04cb5aa30fcc",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    "companyName": "Blockchain Innovations Inc.",
    "shortDescription": "",
    "logoUrl": "",
    "createdAt": "2025-03-10T07:19:03.882Z",
    "updatedAt": "2025-03-10T07:19:03.882Z"
  }
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## PUT /userProfile

Operation ID: `updateUserProfile`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Profile updated successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Missing required fields: role, walletAddress"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /projects

Operation ID: `listProjects`

### Results

✅ **Success**

Response structure matches expected format

#### Expected Response
```json
{
  "isSuccess": true,
  "data": []
}
```

#### Actual Response
```json
{
  "isSuccess": true,
  "data": []
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## POST /projects

Operation ID: `createProject`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data
Extra keys in actual response not in expected response: errors


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Project created successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Missing required fields: projectName, projectOwner",
  "errors": {
    "projectName": [
      "ProjectName is required"
    ],
    "projectOwner": [
      "ProjectOwner is required"
    ]
  }
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /projects/{projectId}

Operation ID: `getProjectDetails`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data
Extra keys in actual response not in expected response: message


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Internal server error"
}
```

### Error Response Tests

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## PUT /projects/{projectId}

Operation ID: `updateProject`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Project updated successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Internal server error"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## DELETE /projects/{projectId}

Operation ID: `deleteProject`

### Results

✅ **Success**

Response structure matches expected format

#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Project deleted successfully"
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Internal server error"
}
```

### Error Response Tests

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## PUT /projects/{projectId}/status

Operation ID: `updateProjectStatus`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess, data


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Project status updated successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "message": "Internal server error"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## POST /projects/{projectId}/assign

Operation ID: `assignFreelancer`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess, data


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Freelancer assigned successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "message": "Internal server error"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 409 Response

⚠️ Manual testing required for 409 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /projects/search

Operation ID: `searchProjects`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "data": {
    "command": "SELECT",
    "rowCount": 0,
    "oid": null,
    "rows": [],
    "fields": [
      {
        "name": "id",
        "tableID": 16664,
        "columnID": 1,
        "dataTypeID": 2950,
        "dataTypeSize": 16,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "project_name",
        "tableID": 16664,
        "columnID": 2,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "project_description",
        "tableID": 16664,
        "columnID": 3,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "prize_amount",
        "tableID": 16664,
        "columnID": 4,
        "dataTypeID": 23,
        "dataTypeSize": 4,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "project_status",
        "tableID": 16664,
        "columnID": 5,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "project_owner",
        "tableID": 16664,
        "columnID": 6,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "required_skills",
        "tableID": 16664,
        "columnID": 7,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "assigned_freelancer",
        "tableID": 16664,
        "columnID": 8,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "created_at",
        "tableID": 16664,
        "columnID": 9,
        "dataTypeID": 1114,
        "dataTypeSize": 8,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "updated_at",
        "tableID": 16664,
        "columnID": 10,
        "dataTypeID": 1114,
        "dataTypeSize": 8,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "project_repo",
        "tableID": 16664,
        "columnID": 11,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "completion_skills",
        "tableID": 16664,
        "columnID": 12,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "project_owner_username",
        "tableID": 16664,
        "columnID": 13,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      },
      {
        "name": "assigned_freelancer_username",
        "tableID": 16664,
        "columnID": 14,
        "dataTypeID": 25,
        "dataTypeSize": -1,
        "dataTypeModifier": -1,
        "format": "text"
      }
    ],
    "_parsers": [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    "_types": {},
    "RowCtor": null,
    "rowAsArray": false,
    "_prebuiltEmptyResultObject": {
      "id": null,
      "project_name": null,
      "project_description": null,
      "prize_amount": null,
      "project_status": null,
      "project_owner": null,
      "required_skills": null,
      "assigned_freelancer": null,
      "created_at": null,
      "updated_at": null,
      "project_repo": null,
      "completion_skills": null,
      "project_owner_username": null,
      "assigned_freelancer_username": null
    }
  }
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /projects/stats

Operation ID: `getProjectStats`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "data": {
    "summary": {
      "totalProjects": 0,
      "openProjects": 0,
      "closedProjects": 0,
      "totalPrizeAmount": 0
    },
    "skillDistribution": [],
    "monthlyTrend": []
  }
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /projects/{projectId}/submissions

Operation ID: `getProjectSubmissions`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data
Extra keys in actual response not in expected response: message


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Internal error"
}
```

### Error Response Tests

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## POST /submissions/create

Operation ID: `createSubmission`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Submission created successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Missing required fields: projectId, freelancerAddress, prLink"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /submissions/read

Operation ID: `getSubmissions`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data
Extra keys in actual response not in expected response: message, debugInfo


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Internal server error",
  "debugInfo": {
    "message": "column \"project_id\" does not exist",
    "code": "42703",
    "name": "error",
    "stack": "error: column \"project_id\" does not exist\n    at /var/task/node_modules/pg-pool/index.js:45:11\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async /var/task/.next/server/chunks/4554.js:7:36557\n    at async A (/var/task/.next/server/app/api/submissions/read/route.js:1:1238)\n    at async /var/task/.next/server/chunks/2762.js:1:13561\n    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411\n    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)\n    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)\n    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25516)\n    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)",
    "dbURL": "postgresql:****@learn-ledger-do-user-19783146-0.m.db.ondigitalocean.com:25061/learn-ledger-pool?sslmode=require",
    "env": "production",
    "vercelEnv": "production"
  }
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## POST /submissions/approve

Operation ID: `approveSubmission`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: data


#### Expected Response
```json
{
  "isSuccess": true,
  "message": "Submission approved successfully",
  "data": null
}
```

#### Actual Response
```json
{
  "isSuccess": false,
  "message": "Internal server error"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## DELETE /submissions/delete

Operation ID: `deleteSubmission`

### Results

❌ **Discrepancy Found**

Failed to test endpoint: Unexpected end of JSON input

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 403 Response

⚠️ Manual testing required for 403 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /company/{companyId}

Operation ID: `getCompanyDetails`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess, data
Extra keys in actual response not in expected response: error


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "error": "API route not found"
}
```

### Error Response Tests

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /freelancer/{freelancerId}

Operation ID: `getFreelancerDetails`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess, data
Extra keys in actual response not in expected response: error


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "error": "API route not found"
}
```

### Error Response Tests

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /github/verify

Operation ID: `verifyGitHubRepo`

### Results

❌ **Discrepancy Found**

Expected keys missing from actual response: isSuccess, data
Extra keys in actual response not in expected response: error


#### Expected Response
```json
{
  "isSuccess": true,
  "data": null
}
```

#### Actual Response
```json
{
  "error": "API route not found"
}
```

### Error Response Tests

#### 400 Response

⚠️ Manual testing required for 400 response

#### 404 Response

⚠️ Manual testing required for 404 response

#### 500 Response

⚠️ Manual testing required for 500 response

---

## GET /api-spec

Operation ID: `getApiSpec`

### Results

❌ **Discrepancy Found**

Extra keys in actual response not in expected response: openapi, info, servers, tags, components, paths


#### Expected Response
```json
{}
```

#### Actual Response
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "ProjectLedger API Documentation",
    "version": "1.0.0",
    "description": "API documentation for the ProjectLedger platform",
    "contact": {
      "name": "API Support",
      "email": "support@projectledger.com"
    }
  },
  "servers": [
    {
      "url": "/api",
      "description": "Production server"
    }
  ],
  "tags": [
    {
      "name": "Register",
      "description": "User registration operations"
    },
    {
      "name": "User Profile",
      "description": "User profile operations"
    },
    {
      "name": "Projects",
      "description": "Project management operations"
    },
    {
      "name": "Submissions",
      "description": "Project submission operations"
    }
  ],
  "components": {
    "schemas": {
      "Error": {
        "type": "object",
        "properties": {
          "isSuccess": {
            "type": "boolean",
            "example": false
          },
          "message": {
            "type": "string",
            "example": "Error occurred"
          },
          "errors": {
            "type": "object",
            "additionalProperties": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "example": null
          }
        },
        "required": [
          "isSuccess"
        ]
      },
      "ValidationError": {
        "type": "object",
        "properties": {
          "isSuccess": {
            "type": "boolean",
            "example": false
          },
          "message": {
            "type": "string",
            "example": "Validation failed"
          },
          "errors": {
            "type": "object",
            "additionalProperties": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "example": {
              "walletAddress": [
                "Invalid wallet address format"
              ],
              "role": [
                "Role must be either \"company\" or \"freelancer\""
              ]
            }
          }
        },
        "required": [
          "isSuccess",
          "message",
          "errors"
        ]
      },
      "ServerError": {
        "type": "object",
        "properties": {
          "isSuccess": {
            "type": "boolean",
            "example": false
          },
          "message": {
            "type": "string",
            "example": "Internal server error"
          }
        },
        "required": [
          "isSuccess",
          "message"
        ]
      },
      "Success": {
        "type": "object",
        "properties": {
          "isSuccess": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Operation successful"
          },
          "data": {
            "type": "object",
            "example": {}
          }
        },
        "required": [
          "isSuccess"
        ]
      },
      "WalletAddress": {
        "type": "string",
        "pattern": "^0x[a-fA-F0-9]{40}$",
        "example": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      },
      "Role": {
        "type": "string",
        "enum": [
          "company",
          "freelancer"
        ],
        "example": "company"
      },
      "CompanyProfile": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "walletAddress": {
            "$ref": "#/components/schemas/WalletAddress"
          },
          "companyName": {
            "type": "string",
            "example": "Acme Corporation"
          },
          "shortDescription": {
            "type": "string",
            "example": "A leading tech company"
          },
          "logoUrl": {
            "type": "string",
            "format": "uri",
            "example": "https://example.com/logo.png"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "id",
          "walletAddress",
          "companyName"
        ]
      },
      "FreelancerProfile": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "walletAddress": {
            "$ref": "#/components/schemas/WalletAddress"
          },
          "name": {
            "type": "string",
            "example": "John Doe"
          },
          "skills": {
            "type": "string",
            "example": "JavaScript, React, Node.js"
          },
          "profilePicUrl": {
            "type": "string",
            "format": "uri",
            "example": "https://example.com/profile.png"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "id",
          "walletAddress",
          "name"
        ]
      },
      "Project": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "projectName": {
            "type": "string",
            "example": "Website Redesign"
          },
          "projectDescription": {
            "type": "string",
            "example": "Redesign the company website using modern technologies"
          },
          "prizeAmount": {
            "type": "string",
            "example": "1000"
          },
          "projectStatus": {
            "type": "string",
            "enum": [
              "open",
              "closed",
              "in-progress"
            ],
            "example": "open"
          },
          "projectOwner": {
            "$ref": "#/components/schemas/WalletAddress"
          },
          "requiredSkills": {
            "type": "string",
            "example": "JavaScript, React, HTML, CSS"
          },
          "completionSkills": {
            "type": "string",
            "example": "Project Management, UI Design"
          },
          "assignedFreelancer": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/WalletAddress"
              },
              {
                "type": "null"
              }
            ]
          },
          "projectRepo": {
            "type": "string",
            "example": "https://github.com/owner/repo"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "id",
          "projectName",
          "projectOwner",
          "projectStatus"
        ]
      },
      "Submission": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "projectId": {
            "type": "string",
            "format": "uuid"
          },
          "freelancerAddress": {
            "$ref": "#/components/schemas/WalletAddress"
          },
          "prLink": {
            "type": "string",
            "example": "https://github.com/owner/repo/pull/123"
          },
          "repoOwner": {
            "type": "string",
            "example": "owner"
          },
          "repoName": {
            "type": "string",
            "example": "repo"
          },
          "prNumber": {
            "type": "string",
            "example": "123"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "id",
          "projectId",
          "freelancerAddress",
          "prLink"
        ]
      }
    },
    "securitySchemes": {},
    "responses": {
      "SubmissionsSuccess": {
        "description": "Submissions retrieved successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "isSuccess": {
                  "type": "boolean",
                  "example": true
                },
                "message": {
                  "type": "string",
                  "example": "Submissions retrieved successfully"
                },
                "data": {
                  "oneOf": [
                    {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890"
                          },
                          "projectId": {
                            "type": "string",
                            "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                          },
                          "freelancerAddress": {
                            "type": "string",
                            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                          },
                          "prLink": {
                            "type": "string",
                            "example": "https://github.com/example/repo/pull/1"
                          },
                          "status": {
                            "type": "string",
                            "example": "pending"
                          },
                          "createdAt": {
                            "type": "string",
                            "format": "date-time",
                            "example": "2023-08-10T14:30:00Z"
                          }
                        }
                      }
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890"
                        },
                        "projectId": {
                          "type": "string",
                          "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                        },
                        "freelancerAddress": {
                          "type": "string",
                          "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                        },
                        "prLink": {
                          "type": "string",
                          "example": "https://github.com/example/repo/pull/1"
                        },
                        "status": {
                          "type": "string",
                          "example": "pending"
                        },
                        "createdAt": {
                          "type": "string",
                          "format": "date-time",
                          "example": "2023-08-10T14:30:00Z"
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "paths": {
    "/api/register": {
      "post": {
        "tags": [
          "Register"
        ],
        "summary": "Register a new user profile",
        "description": "Creates a company or freelancer profile with the provided details",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "role": {
                    "type": "string",
                    "enum": [
                      "company",
                      "freelancer"
                    ],
                    "description": "Type of account to register"
                  },
                  "walletAddress": {
                    "type": "string",
                    "description": "Ethereum wallet address"
                  },
                  "companyName": {
                    "type": "string",
                    "description": "Required for company profiles"
                  },
                  "shortDescription": {
                    "type": "string",
                    "description": "Brief description about the company"
                  },
                  "logoUrl": {
                    "type": "string",
                    "description": "URL to company logo image"
                  },
                  "name": {
                    "type": "string",
                    "description": "Required for freelancer profiles"
                  },
                  "skills": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Skills for freelancer profiles"
                  },
                  "profilePicUrl": {
                    "type": "string",
                    "description": "URL to profile picture for freelancers"
                  }
                },
                "required": [
                  "role",
                  "walletAddress"
                ],
                "example": {
                  "role": "company",
                  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                  "companyName": "Acme Corporation",
                  "shortDescription": "Leading provider of blockchain solutions",
                  "logoUrl": "https://example.com/logo.png"
                },
                "examples": {
                  "company": {
                    "value": {
                      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                      "role": "company",
                      "companyName": "Blockchain Innovations Inc.",
                      "companyWebsite": "https://blockchain-innovations.com"
                    }
                  },
                  "freelancer": {
                    "value": {
                      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                      "role": "freelancer",
                      "name": "John Doe",
                      "skills": [
                        "JavaScript",
                        "React",
                        "Web3"
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Registration successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Successfully registered profile"
                    },
                    "data": {
                      "type": "string",
                      "description": "Profile ID",
                      "example": "f290c15c-a0bf-494a-8df0-05e94aa3b89f"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Missing required fields": {
                    "value": {
                      "isSuccess": false,
                      "message": "Validation failed",
                      "errors": {
                        "walletAddress": [
                          "Wallet address is required"
                        ],
                        "role": [
                          "Role must be specified"
                        ]
                      }
                    }
                  },
                  "Invalid wallet format": {
                    "value": {
                      "isSuccess": false,
                      "message": "Validation failed",
                      "errors": {
                        "walletAddress": [
                          "Invalid Ethereum wallet address format"
                        ]
                      }
                    }
                  },
                  "Missing role-specific fields": {
                    "value": {
                      "isSuccess": false,
                      "message": "Validation failed",
                      "errors": {
                        "companyName": [
                          "Company name is required for company profiles"
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to create user profile record"
                    }
                  },
                  "Duplicate entry": {
                    "value": {
                      "isSuccess": false,
                      "message": "Profile with this wallet address already exists"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/userProfile": {
      "get": {
        "tags": [
          "User Profile"
        ],
        "summary": "Get user profile",
        "description": "Retrieves a user profile by wallet address and role",
        "parameters": [
          {
            "name": "walletAddress",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Ethereum wallet address of the user",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          {
            "name": "role",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "enum": [
                "company",
                "freelancer"
              ]
            },
            "description": "Role of the user (company or freelancer)",
            "example": "company"
          }
        ],
        "responses": {
          "200": {
            "description": "Profile fetched successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Profile found"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "f290c15c-a0bf-494a-8df0-05e94aa3b89f"
                        },
                        "walletAddress": {
                          "type": "string",
                          "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                        },
                        "companyName": {
                          "type": "string",
                          "example": "Acme Corporation"
                        },
                        "shortDescription": {
                          "type": "string",
                          "example": "Leading provider of blockchain solutions"
                        },
                        "logoUrl": {
                          "type": "string",
                          "example": "https://example.com/logo.png"
                        },
                        "createdAt": {
                          "type": "string",
                          "format": "date-time",
                          "example": "2023-08-10T14:30:00Z"
                        },
                        "updatedAt": {
                          "type": "string",
                          "format": "date-time",
                          "example": "2023-08-10T14:30:00Z"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Missing required parameters": {
                    "value": {
                      "isSuccess": false,
                      "message": "Missing required fields: walletAddress, role",
                      "errors": {
                        "walletAddress": [
                          "Wallet address is required"
                        ],
                        "role": [
                          "Role is required"
                        ]
                      }
                    }
                  },
                  "Invalid role": {
                    "value": {
                      "isSuccess": false,
                      "message": "Role must be either \"company\" or \"freelancer\"",
                      "errors": {
                        "role": [
                          "Role must be either \"company\" or \"freelancer\""
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Profile not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": false
                    },
                    "message": {
                      "type": "string",
                      "example": "Profile not found for the given wallet address and role"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to fetch user profile"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "User Profile"
        ],
        "summary": "Update user profile",
        "description": "Updates an existing user profile with new information",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "role": {
                    "type": "string",
                    "enum": [
                      "company",
                      "freelancer"
                    ],
                    "description": "Type of account to update"
                  },
                  "walletAddress": {
                    "type": "string",
                    "description": "Ethereum wallet address"
                  },
                  "companyName": {
                    "type": "string",
                    "description": "For company profiles"
                  },
                  "shortDescription": {
                    "type": "string",
                    "description": "Brief description about the company/freelancer"
                  },
                  "logoUrl": {
                    "type": "string",
                    "description": "URL to company logo image"
                  },
                  "name": {
                    "type": "string",
                    "description": "For freelancer profiles"
                  },
                  "skills": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Skills for freelancer profiles"
                  },
                  "profilePicUrl": {
                    "type": "string",
                    "description": "URL to profile picture for freelancers"
                  }
                },
                "required": [
                  "role",
                  "walletAddress"
                ],
                "example": {
                  "role": "company",
                  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                  "companyName": "Acme Corporation Updated",
                  "shortDescription": "Leading provider of advanced blockchain solutions",
                  "logoUrl": "https://example.com/new-logo.png",
                  "name": "Updated Name",
                  "skills": [
                    "JavaScript",
                    "React",
                    "Web3",
                    "Solidity"
                  ]
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Profile updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Profile updated successfully"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Missing required fields": {
                    "value": {
                      "isSuccess": false,
                      "message": "Missing required fields: walletAddress, role",
                      "errors": {
                        "walletAddress": [
                          "Wallet address is required"
                        ],
                        "role": [
                          "Role is required"
                        ]
                      }
                    }
                  },
                  "Invalid role": {
                    "value": {
                      "isSuccess": false,
                      "message": "Role must be either \"company\" or \"freelancer\"",
                      "errors": {
                        "role": [
                          "Role must be either \"company\" or \"freelancer\""
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Profile not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": false
                    },
                    "message": {
                      "type": "string",
                      "example": "Profile not found for the given wallet address and role"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to update user profile"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "User Profile"
        ],
        "summary": "Delete user profile",
        "description": "Deletes a user profile by wallet address and role",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "role": {
                    "type": "string",
                    "enum": [
                      "company",
                      "freelancer"
                    ],
                    "description": "Type of account to delete"
                  },
                  "walletAddress": {
                    "type": "string",
                    "description": "Ethereum wallet address"
                  }
                },
                "required": [
                  "role",
                  "walletAddress"
                ],
                "example": {
                  "role": "company",
                  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Profile deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Profile deleted successfully"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Missing required fields": {
                    "value": {
                      "isSuccess": false,
                      "message": "Missing required fields: walletAddress, role",
                      "errors": {
                        "walletAddress": [
                          "Wallet address is required"
                        ],
                        "role": [
                          "Role is required"
                        ]
                      }
                    }
                  },
                  "Invalid role": {
                    "value": {
                      "isSuccess": false,
                      "message": "Role must be either \"company\" or \"freelancer\"",
                      "errors": {
                        "role": [
                          "Role must be either \"company\" or \"freelancer\""
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Profile not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": false
                    },
                    "message": {
                      "type": "string",
                      "example": "Profile not found for the given wallet address and role"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to delete user profile"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/projects": {
      "get": {
        "tags": [
          "Projects"
        ],
        "summary": "Get projects list",
        "description": "Retrieves a list of projects with optional filtering",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "open",
                "in-progress",
                "completed"
              ]
            },
            "description": "Filter projects by status",
            "example": "open"
          },
          {
            "name": "skill",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Filter projects by required skill",
            "example": "React"
          },
          {
            "name": "minPrize",
            "in": "query",
            "schema": {
              "type": "number"
            },
            "description": "Minimum prize amount",
            "example": 100
          },
          {
            "name": "maxPrize",
            "in": "query",
            "schema": {
              "type": "number"
            },
            "description": "Maximum prize amount",
            "example": 1000
          },
          {
            "name": "owner",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Filter by project owner wallet address",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          {
            "name": "sort",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "created",
                "prize",
                "name"
              ]
            },
            "description": "Field to sort by",
            "example": "created"
          },
          {
            "name": "order",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            },
            "description": "Sort order",
            "example": "desc"
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            },
            "description": "Number of projects to return (max 100)",
            "example": 20
          },
          {
            "name": "offset",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 0
            },
            "description": "Number of projects to skip",
            "example": 0
          }
        ],
        "responses": {
          "200": {
            "description": "Projects list fetched successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Projects fetched successfully"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                          },
                          "projectName": {
                            "type": "string",
                            "example": "Decentralized Exchange UI"
                          },
                          "projectDescription": {
                            "type": "string",
                            "example": "Build a modern user interface for our decentralized exchange"
                          },
                          "projectLink": {
                            "type": "string",
                            "example": "https://github.com/example/dex-ui"
                          },
                          "prizeAmount": {
                            "type": "string",
                            "example": "500"
                          },
                          "projectStatus": {
                            "type": "string",
                            "example": "open"
                          },
                          "projectOwner": {
                            "type": "string",
                            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                          },
                          "requiredSkills": {
                            "type": "string",
                            "example": "React, TypeScript, Web3"
                          },
                          "assignedFreelancer": {
                            "type": "string",
                            "example": null
                          },
                          "createdAt": {
                            "type": "string",
                            "format": "date-time",
                            "example": "2023-08-10T14:30:00Z"
                          },
                          "updatedAt": {
                            "type": "string",
                            "format": "date-time",
                            "example": "2023-08-10T14:30:00Z"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Invalid status value": {
                    "value": {
                      "isSuccess": false,
                      "message": "Invalid status parameter",
                      "errors": {
                        "status": [
                          "Status must be one of: open, in-progress, completed"
                        ]
                      }
                    }
                  },
                  "Invalid price range": {
                    "value": {
                      "isSuccess": false,
                      "message": "Invalid price range",
                      "errors": {
                        "minPrize": [
                          "Minimum prize must be less than maximum prize"
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to fetch projects"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Projects"
        ],
        "summary": "Create a new project",
        "description": "Creates a new project with the specified details",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "projectName": {
                    "type": "string",
                    "description": "Name of the project"
                  },
                  "projectDescription": {
                    "type": "string",
                    "description": "Detailed description of the project"
                  },
                  "projectLink": {
                    "type": "string",
                    "description": "Link to project repository or details"
                  },
                  "prizeAmount": {
                    "type": "number",
                    "description": "Prize amount for completing the project"
                  },
                  "projectOwner": {
                    "type": "string",
                    "description": "Wallet address of the project owner"
                  },
                  "requiredSkills": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Skills required for the project"
                  }
                },
                "required": [
                  "projectName",
                  "projectOwner"
                ],
                "example": {
                  "projectName": "Blockchain Explorer",
                  "projectDescription": "Build a user-friendly explorer for our custom blockchain",
                  "projectLink": "https://github.com/example/explorer",
                  "prizeAmount": 750,
                  "projectOwner": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                  "requiredSkills": [
                    "React",
                    "TypeScript",
                    "Blockchain"
                  ]
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Project created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Project created successfully"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                        },
                        "projectName": {
                          "type": "string",
                          "example": "Blockchain Explorer"
                        },
                        "projectStatus": {
                          "type": "string",
                          "example": "open"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Missing required fields": {
                    "value": {
                      "isSuccess": false,
                      "message": "Missing required fields",
                      "errors": {
                        "projectName": [
                          "Project name is required"
                        ],
                        "projectOwner": [
                          "Project owner wallet address is required"
                        ]
                      }
                    }
                  },
                  "Invalid wallet address": {
                    "value": {
                      "isSuccess": false,
                      "message": "Invalid wallet address format",
                      "errors": {
                        "projectOwner": [
                          "Wallet address must be a valid Ethereum address starting with 0x"
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to create project"
                    }
                  },
                  "Owner not found": {
                    "value": {
                      "isSuccess": false,
                      "message": "Project owner does not have a registered profile"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/submissions/create": {
      "post": {
        "tags": [
          "Submissions"
        ],
        "summary": "Create a project submission",
        "description": "Submits a project PR as a freelancer",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "projectId": {
                    "type": "string",
                    "description": "ID of the project being submitted for"
                  },
                  "freelancerAddress": {
                    "type": "string",
                    "description": "Wallet address of the freelancer"
                  },
                  "prLink": {
                    "type": "string",
                    "description": "Link to the pull request"
                  }
                },
                "required": [
                  "projectId",
                  "freelancerAddress",
                  "prLink"
                ],
                "example": {
                  "projectId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
                  "freelancerAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                  "prLink": "https://github.com/example/repo/pull/1"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Submission created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Submission created successfully"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890"
                        },
                        "projectId": {
                          "type": "string",
                          "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                        },
                        "freelancerAddress": {
                          "type": "string",
                          "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                        },
                        "prLink": {
                          "type": "string",
                          "example": "https://github.com/example/repo/pull/1"
                        },
                        "status": {
                          "type": "string",
                          "example": "pending"
                        },
                        "createdAt": {
                          "type": "string",
                          "format": "date-time",
                          "example": "2023-08-10T14:30:00Z"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Missing required fields": {
                    "value": {
                      "isSuccess": false,
                      "message": "Missing required fields: projectId, freelancerAddress, prLink",
                      "errors": {
                        "projectId": [
                          "Project ID is required"
                        ],
                        "freelancerAddress": [
                          "Freelancer wallet address is required"
                        ],
                        "prLink": [
                          "PR link is required"
                        ]
                      }
                    }
                  },
                  "Invalid wallet address": {
                    "value": {
                      "isSuccess": false,
                      "message": "Invalid wallet address format",
                      "errors": {
                        "freelancerAddress": [
                          "Wallet address must be a valid Ethereum address starting with 0x"
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Project not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": false
                    },
                    "message": {
                      "type": "string",
                      "example": "Project not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to create submission"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/submissions/read": {
      "get": {
        "tags": [
          "Submissions"
        ],
        "summary": "Get project submissions",
        "description": "Retrieve submissions for a project or by a freelancer",
        "parameters": [
          {
            "name": "submissionId",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Get a specific submission by ID",
            "example": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890"
          },
          {
            "name": "projectId",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Filter submissions by project ID",
            "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
          },
          {
            "name": "freelancerAddress",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Filter submissions by freelancer wallet address",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          }
        ],
        "responses": {
          "200": {
            "description": "Submissions retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Submissions retrieved successfully"
                    },
                    "data": {
                      "oneOf": [
                        {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string",
                                "example": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890"
                              },
                              "projectId": {
                                "type": "string",
                                "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                              },
                              "freelancerAddress": {
                                "type": "string",
                                "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                              },
                              "prLink": {
                                "type": "string",
                                "example": "https://github.com/example/repo/pull/1"
                              },
                              "status": {
                                "type": "string",
                                "example": "pending"
                              },
                              "createdAt": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2023-08-10T14:30:00Z"
                              }
                            }
                          }
                        },
                        {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890"
                            },
                            "projectId": {
                              "type": "string",
                              "example": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                            },
                            "freelancerAddress": {
                              "type": "string",
                              "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                            },
                            "prLink": {
                              "type": "string",
                              "example": "https://github.com/example/repo/pull/1"
                            },
                            "status": {
                              "type": "string",
                              "example": "pending"
                            },
                            "createdAt": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2023-08-10T14:30:00Z"
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                },
                "examples": {
                  "Invalid parameters": {
                    "value": {
                      "isSuccess": false,
                      "message": "Invalid query parameters",
                      "errors": {
                        "freelancerAddress": [
                          "Invalid wallet address format"
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Submission not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": false
                    },
                    "message": {
                      "type": "string",
                      "example": "Submission not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                },
                "examples": {
                  "Database error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Failed to retrieve submissions"
                    }
                  },
                  "Generic server error": {
                    "value": {
                      "isSuccess": false,
                      "message": "Internal server error occurred"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Submissions"
        ],
        "summary": "Get project submissions (legacy)",
        "description": "Retrieve submissions for a project or by a freelancer using POST method",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "submissionId": {
                    "type": "string",
                    "description": "Get a specific submission by ID"
                  },
                  "projectId": {
                    "type": "string",
                    "description": "Filter submissions by project ID"
                  },
                  "freelancerAddress": {
                    "type": "string",
                    "description": "Filter submissions by freelancer wallet address"
                  }
                },
                "example": {
                  "projectId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Submissions retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/responses/SubmissionsSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                }
              }
            }
          },
          "404": {
            "description": "Submission not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "isSuccess": {
                      "type": "boolean",
                      "example": false
                    },
                    "message": {
                      "type": "string",
                      "example": "Submission not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                }
              }
            }
          }
        }
      }
    },
    "/submissions/delete": {
      "post": {
        "tags": [
          "Submissions"
        ],
        "summary": "Delete submission",
        "description": "Deletes a project submission",
        "operationId": "deleteSubmission",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "submissionId": {
                    "type": "string",
                    "format": "uuid"
                  },
                  "walletAddress": {
                    "$ref": "#/components/schemas/WalletAddress"
                  }
                },
                "required": [
                  "submissionId",
                  "walletAddress"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Submission deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Success"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden - Not authorized to delete this submission",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Submission not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ServerError"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## GET /docs

Operation ID: `getApiDocs`

### Results

❌ **Discrepancy Found**

No expected response defined in OpenAPI spec

---

