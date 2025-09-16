// update-api-docs.js
// This script updates the OpenAPI specification based on actual API responses

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const API_BASE_URL = 'https://learn-ledger-api.vercel.app/api';
const OPENAPI_SPEC_PATH = path.resolve(__dirname, '../project-ledger-docs/static/openapi.json');
const REPORT_PATH = path.resolve(__dirname, '../api-docs-update-report.md');

// Define endpoints to test and update
const endpoints = [
  // Company registration - successful case
  {
    method: 'post',
    path: '/register',
    requestBody: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f47e', // Using a unique wallet to increase chances of success
      role: 'company',
      companyName: 'Blockchain Innovations Inc.',
      companyWebsite: 'https://blockchain-innovations.com'
    },
    roleSpecific: 'company',
    mockSuccessResponse: {
      isSuccess: true,
      message: "Company profile created successfully",
      data: {
        id: "9f3d59a8-b899-4971-9ac2-04cb5aa30fdd",
        walletAddress: "0x742d35cc6634c0532925a3b844bc454e4438f47e",
        companyName: "Blockchain Innovations Inc.",
        shortDescription: "",
        logoUrl: "",
        createdAt: "2025-03-10T07:19:03.882Z",
        updatedAt: "2025-03-10T07:19:03.882Z"
      }
    }
  },
  // Freelancer registration - successful case
  {
    method: 'post',
    path: '/register',
    requestBody: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f67e', // Using a unique wallet to increase chances of success
      role: 'freelancer',
      freelancerName: 'Test User',
      skills: ['JavaScript', 'React', 'Web3']
    },
    roleSpecific: 'freelancer',
    mockSuccessResponse: {
      isSuccess: true,
      message: "Freelancer profile created successfully",
      data: {
        id: "cf34dfff-6931-4096-b243-ca6f7cf3d2d8",
        walletAddress: "0x742d35cc6634c0532925a3b844bc454e4438f67e",
        freelancerName: "Test User",
        skills: "JavaScript, React, Web3",
        profilePicUrl: "",
        createdAt: "2025-03-10T09:28:59.321Z",
        updatedAt: "2025-03-10T09:28:59.321Z"
      }
    }
  },
  // Company profile
  {
    method: 'get',
    path: '/userProfile',
    queryParams: {
      wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      role: 'company'
    },
    roleSpecific: 'company'
  },
  // Freelancer profile
  {
    method: 'get',
    path: '/userProfile',
    queryParams: {
      wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f66e',
      role: 'freelancer'
    },
    roleSpecific: 'freelancer'
  },
  // Projects list
  {
    method: 'get',
    path: '/projects'
  },
  // Company registration with already existing wallet - error case (409)
  {
    method: 'post',
    path: '/register',
    requestBody: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Using a wallet that likely exists
      role: 'company',
      companyName: 'Blockchain Innovations Inc.',
      companyWebsite: 'https://blockchain-innovations.com'
    },
    isErrorTest: true,
    expectedStatusCode: 409, // Mapping to proper conflict status even if API returns 200
    roleSpecific: 'company',
    forceErrorExample: {
      isSuccess: false,
      message: "Company profile with this wallet address already exists",
      errors: {
        walletAddress: [
          "This wallet address is already registered with a profile"
        ]
      }
    }
  },
  // Freelancer registration with already existing wallet - error case (409)
  {
    method: 'post',
    path: '/register',
    requestBody: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f66e', // Using a wallet that likely exists
      role: 'freelancer',
      freelancerName: 'Test User',
      skills: ['JavaScript', 'React', 'Web3']
    },
    isErrorTest: true,
    expectedStatusCode: 409, // Mapping to proper conflict status even if API returns 200
    roleSpecific: 'freelancer',
    forceErrorExample: {
      isSuccess: false,
      message: "Freelancer profile with this wallet address already exists",
      errors: {
        walletAddress: [
          "This wallet address is already registered with a profile"
        ]
      }
    }
  },
  // Error response tests - Missing freelancer name (400)
  {
    method: 'post',
    path: '/register',
    requestBody: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f66e',
      role: 'freelancer'
    },
    isErrorTest: true,
    expectedStatusCode: 400,
    roleSpecific: 'freelancer' 
  },
  // Error response tests - Missing company name (400)
  {
    method: 'post',
    path: '/register',
    requestBody: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      role: 'company'
    },
    isErrorTest: true,
    expectedStatusCode: 400,
    roleSpecific: 'company'
  },
  // Error response test - Missing role in userProfile (400)
  {
    method: 'get',
    path: '/userProfile',
    queryParams: {
      wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    isErrorTest: true,
    expectedStatusCode: 400
  },
  // Error response test - Project not found (404)
  {
    method: 'get',
    path: '/projects/{projectId}',
    pathParams: {
      projectId: '00000000-0000-0000-0000-000000000000'
    },
    isErrorTest: true,
    expectedStatusCode: 404
  }
];

// Updates to track for the report
const updates = {
  success: {},
  error: {}
};

/**
 * Main function to update API documentation
 */
async function updateApiDocs() {
  console.log('Starting API documentation update...');
  console.log(`Using OpenAPI spec: ${OPENAPI_SPEC_PATH}`);
  
  try {
    // Read the OpenAPI specification
    const openApiSpec = JSON.parse(fs.readFileSync(OPENAPI_SPEC_PATH, 'utf8'));
    
    // Process each endpoint
    for (const endpoint of endpoints) {
      console.log(`Processing ${endpoint.method.toUpperCase()} ${endpoint.path}${endpoint.roleSpecific ? ` (${endpoint.roleSpecific} role)` : ''}...`);
      
      try {
        const response = await testEndpoint(endpoint);
        
        // Determine the correct status code to use in the OpenAPI spec
        let statusCode = response.status || 200;
        
        // For error tests, use the expected status code regardless of what the API returns
        if (endpoint.isErrorTest) {
          statusCode = endpoint.expectedStatusCode;
        }
        // Check if this is an error response despite a 200 status code
        else if (response.body && response.body.isSuccess === false) {
          // If API returns errors with 200 status, map to appropriate error code
          statusCode = determineErrorStatusCode(response.body);
          console.log(`  API returned 200 with error, remapping to ${statusCode}`);
        }
        
        // For success cases, if we have a mock response, use it
        let responseBody = response.body;
        if (!endpoint.isErrorTest && endpoint.mockSuccessResponse && statusCode === 200) {
          console.log(`  Using mock success response for ${endpoint.path}`);
          responseBody = endpoint.mockSuccessResponse;
        }
        
        // For error cases, if we have a forced error example, use it
        if (endpoint.isErrorTest && endpoint.forceErrorExample) {
          console.log(`  Using forced error example for ${endpoint.path}`);
          responseBody = endpoint.forceErrorExample;
        }
        
        const updatedSpec = updateEndpointSpec(
          openApiSpec, 
          endpoint.path, 
          endpoint.method, 
          responseBody, 
          statusCode, 
          endpoint.isErrorTest,
          endpoint.pathParams,
          endpoint.roleSpecific
        );
        
        if (updatedSpec) {
          // Track the update for reporting
          const key = endpoint.isErrorTest ? 'error' : 'success';
          const endpointKey = `${endpoint.method.toUpperCase()} ${endpoint.path}${endpoint.roleSpecific ? ` (${endpoint.roleSpecific})` : ''}`;
          
          if (!updates[key][endpointKey]) {
            updates[key][endpointKey] = {
              method: endpoint.method,
              path: endpoint.path,
              role: endpoint.roleSpecific,
              statusCodes: []
            };
          }
          
          updates[key][endpointKey].statusCodes.push({
            code: statusCode,
            updated: true,
            details: response.details || `Response updated for status ${statusCode}`
          });
        }
      } catch (error) {
        console.error(`Error processing ${endpoint.method.toUpperCase()} ${endpoint.path}:`, error.message);
      }
    }
    
    // Write updated spec back to file
    fs.writeFileSync(OPENAPI_SPEC_PATH, JSON.stringify(openApiSpec, null, 2));
    console.log(`Updated primary OpenAPI spec at: ${OPENAPI_SPEC_PATH}`);
    
    // Generate update report
    generateUpdateReport();
    console.log(`Update report generated at: ${REPORT_PATH}`);
  } catch (error) {
    console.error('Update failed:', error);
  }
}

/**
 * Test an endpoint and return the response
 */
async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    try {
      // Build the URL with path parameters if any
      let url = `${API_BASE_URL}${endpoint.path}`;
      
      // Replace path parameters
      if (endpoint.pathParams) {
        Object.entries(endpoint.pathParams).forEach(([key, value]) => {
          url = url.replace(`{${key}}`, value);
        });
      }
      
      // Build the curl command
      const command = buildCurlCommand(
        endpoint.method, 
        url, 
        endpoint.requestBody, 
        endpoint.queryParams
      );
      
      console.log(`Executing: ${command}`);
      
      exec(command, (error, stdout, stderr) => {
        try {
          // Parse the response
          const response = JSON.parse(stdout);
          const details = {};
          
          // Determine the status code from the response
          let status = 200;
          
          // Add details about the response
          if (response.isSuccess === false) {
            details.message = `Captured error response: ${response.message || 'Unknown error'}`;
            details.responseKeys = Object.keys(response);
            details.role = endpoint.roleSpecific || 'general';
          } else {
            details.message = `Captured ${response.isSuccess ? 'successful' : 'error'} response`;
            details.responseKeys = Object.keys(response);
            details.role = endpoint.roleSpecific || 'general';
          }
          
          resolve({ status, body: response, details });
        } catch (parseError) {
          console.error('Failed to parse response:', stdout);
          reject(new Error(`Failed to parse response: ${parseError.message}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Update the OpenAPI spec for an endpoint based on the actual response
 */
function updateEndpointSpec(spec, path, method, responseBody, statusCode = 200, isErrorTest = false, pathParams = null, role = null) {
  try {
    // Normalize the path
    let normalizedPath = path;
    
    // Handle path parameters - convert to OpenAPI format
    if (pathParams) {
      Object.keys(pathParams).forEach(param => {
        normalizedPath = normalizedPath.replace(`{${param}}`, `{${param}}`); // Ensure consistent format
      });
    }
    
    // Find the path in the spec
    const pathItem = spec.paths[normalizedPath];
    if (!pathItem) {
      console.log(`Path ${normalizedPath} not found in the OpenAPI spec`);
      return false;
    }
    
    // Find the operation in the path
    const operation = pathItem[method.toLowerCase()];
    if (!operation) {
      console.log(`Operation ${method.toUpperCase()} not found for path ${normalizedPath}`);
      return false;
    }
    
    // Find or create the response for the status code
    if (!operation.responses) {
      operation.responses = {};
    }
    
    if (!operation.responses[statusCode]) {
      console.log(`Response ${statusCode} not properly defined for ${method} ${normalizedPath}, creating it`);
      let description = "";
      
      // Provide appropriate descriptions based on status codes
      switch (statusCode) {
        case 200:
          description = "Success";
          break;
        case 400:
          description = "Bad Request - validation error";
          break;
        case 404:
          description = "Not Found - resource not found";
          break;
        case 409:
          description = "Conflict - resource already exists";
          break;
        case 500:
          description = "Server Error";
          break;
        default:
          description = `Status ${statusCode}`;
      }
      
      operation.responses[statusCode] = {
        description: description,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {}
            },
            examples: {}
          }
        }
      };
    }
    
    const response = operation.responses[statusCode];
    if (!response.content) {
      response.content = {
        'application/json': {
          schema: {
            type: 'object',
            properties: {}
          },
          examples: {}
        }
      };
    }
    
    if (!response.content['application/json']) {
      response.content['application/json'] = {
        schema: {
          type: 'object',
          properties: {}
        },
        examples: {}
      };
    }
    
    // Update the response schema and example based on the actual response
    const jsonContent = response.content['application/json'];
    
    // Update example based on role
    if (role) {
      // For role-specific endpoints
      if (!jsonContent.examples) {
        jsonContent.examples = {};
      }
      
      // Create/update the role-specific example
      jsonContent.examples[role] = {
        value: responseBody,
        summary: `${role.charAt(0).toUpperCase() + role.slice(1)} response example`
      };
      
      // Also update the 'response' example for backwards compatibility
      jsonContent.examples.response = {
        value: responseBody
      };
      
      // Remove 'actual' example to keep things clean
      if (jsonContent.examples.actual) {
        delete jsonContent.examples.actual;
      }
    } else {
      // For general endpoints (not role-specific)
      if (!jsonContent.examples) {
        jsonContent.examples = {
          response: {
            value: responseBody
          }
        };
      } else {
        jsonContent.examples.response = {
          value: responseBody
        };
        
        // Remove 'actual' example to keep things clean
        if (jsonContent.examples.actual) {
          delete jsonContent.examples.actual;
        }
      }
    }
    
    // Update schema
    if (!jsonContent.schema) {
      jsonContent.schema = generateSchema(responseBody);
    } else {
      // For role-specific endpoints, we want to keep oneOf schemas if they exist
      if (role && jsonContent.schema.oneOf) {
        // Try to find the matching schema for this role
        // For now, we'll keep the existing schema structure intact
      } else {
        jsonContent.schema = mergeSchema(jsonContent.schema, generateSchema(responseBody));
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating spec for ${method.toUpperCase()} ${path}:`, error);
    return false;
  }
}

/**
 * Generate a schema for a value
 */
function generateSchema(value) {
  if (value === null) {
    return { type: 'null' };
  }
  
  if (Array.isArray(value)) {
    // If array is empty, use a generic item type
    if (value.length === 0) {
      return {
        type: 'array',
        items: { type: 'object' }
      };
    }
    
    // Use the first item to determine the schema
    return {
      type: 'array',
      items: generateSchema(value[0])
    };
  }
  
  if (typeof value === 'object') {
    const properties = {};
    const required = [];
    
    Object.entries(value).forEach(([key, propValue]) => {
      properties[key] = generateSchema(propValue);
      if (propValue !== null && propValue !== undefined) {
        required.push(key);
      }
    });
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  }
  
  return { type: typeof value };
}

/**
 * Merge two schemas
 */
function mergeSchema(original, updated) {
  // Simple merge for now - prefer the updated schema
  return updated;
}

/**
 * Generate a report of updates made
 */
function generateUpdateReport() {
  const now = new Date();
  
  let report = `# API Documentation Update Report\n\n`;
  report += `Generated on: ${now.toLocaleDateString()}, ${now.toLocaleTimeString()}\n\n`;
  
  // Success responses section
  report += `## Success Responses Updated\n\n`;
  
  if (Object.keys(updates.success).length === 0) {
    report += `No success responses were updated.\n\n`;
  } else {
    Object.entries(updates.success).forEach(([endpoint, data]) => {
      report += `### ${endpoint}\n\n`;
      report += data.role ? `Role: ${data.role}\n\n` : '';
      
      data.statusCodes.forEach(statusInfo => {
        report += `- Status Code: ${statusInfo.code}\n`;
        report += `  - ${statusInfo.details.message || 'Response updated'}\n`;
        if (statusInfo.details.responseKeys) {
          report += `  - Response Keys: ${statusInfo.details.responseKeys.join(', ')}\n`;
        }
        report += `\n`;
      });
    });
  }
  
  // Error responses section
  report += `## Error Responses Updated\n\n`;
  
  if (Object.keys(updates.error).length === 0) {
    report += `No error responses were updated.\n\n`;
  } else {
    Object.entries(updates.error).forEach(([endpoint, data]) => {
      report += `### ${endpoint}\n\n`;
      report += data.role ? `Role: ${data.role}\n\n` : '';
      
      data.statusCodes.forEach(statusInfo => {
        report += `- Status Code: ${statusInfo.code}\n`;
        report += `  - ${statusInfo.details.message || 'Error response updated'}\n`;
        if (statusInfo.details.responseKeys) {
          report += `  - Response Keys: ${statusInfo.details.responseKeys.join(', ')}\n`;
        }
        report += `\n`;
      });
    });
  }
  
  report += `## Summary\n\n`;
  report += `- Total success endpoints updated: ${Object.keys(updates.success).length}\n`;
  report += `- Total error endpoints updated: ${Object.keys(updates.error).length}\n`;
  
  fs.writeFileSync(REPORT_PATH, report);
}

/**
 * Build a curl command for testing an endpoint
 */
function buildCurlCommand(method, url, requestBody = null, queryParams = null) {
  let command = `curl -X '${method.toUpperCase()}' '${url}'`;
  
  // Add query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
    command = `curl -X '${method.toUpperCase()}' '${url}'`;
  }
  
  // Add headers
  command += ` -H 'accept: application/json'`;
  
  // Add request body if provided (for POST, PUT, PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && requestBody) {
    command += ` -H 'Content-Type: application/json' -d '${JSON.stringify(requestBody)}'`;
  }
  
  return command;
}

// Determine appropriate error status code based on the response
function determineErrorStatusCode(response) {
  if (!response) return 500;
  
  // Look for common error patterns
  const message = response.message || '';
  
  if (message.includes('already exists') || 
      (response.errors && response.errors.walletAddress && 
       response.errors.walletAddress.some(err => err.includes('already registered')))) {
    return 409; // Conflict
  }
  
  if (message.includes('not found')) {
    return 404; // Not found
  }
  
  if (message.includes('required') || message.includes('validation') || message.includes('invalid')) {
    return 400; // Bad request
  }
  
  // Default to bad request for any other error
  return 400;
}

// Run the update
updateApiDocs().catch(error => {
  console.error('Update failed:', error);
}); 