// validate-error-responses.js
// This script validates API error documentation against actual error responses

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const API_BASE_URL = 'https://learn-ledger-api.vercel.app/api';
const OPENAPI_SPEC_PATH = path.join(__dirname, '../project-ledger-docs/static/openapi.json');
const ERROR_REPORT_PATH = path.join(__dirname, '../api-error-validation-report.md');

// Error test scenarios
const ERROR_SCENARIOS = {
  '/register': [
    {
      method: 'POST',
      description: '409 Conflict - User already registered',
      status: '409',
      testCase: {
        // First register a user, then try to register again with the same wallet
        setup: {
          method: 'POST',
          body: {
            walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            role: "freelancer",
            freelancerName: "Test User",
            skills: ["JavaScript", "React", "Web3"]
          }
        },
        test: {
          method: 'POST',
          body: {
            walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            role: "freelancer",
            freelancerName: "Duplicate User",
            skills: ["JavaScript"]
          }
        }
      }
    },
    {
      method: 'POST',
      description: '400 Bad Request - Missing required fields',
      status: '400',
      testCase: {
        method: 'POST',
        body: {
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f55e",
          role: "freelancer"
          // Missing freelancerName
        }
      }
    },
    {
      method: 'POST',
      description: '400 Bad Request - Invalid wallet address format',
      status: '400',
      testCase: {
        method: 'POST',
        body: {
          walletAddress: "invalid-wallet-address",
          role: "freelancer",
          freelancerName: "Invalid Wallet User"
        }
      }
    }
  ],
  '/userProfile': [
    {
      method: 'GET',
      description: '400 Bad Request - Missing wallet parameter',
      status: '400',
      testCase: {
        method: 'GET',
        params: {
          // Missing wallet
          role: 'freelancer'
        }
      }
    },
    {
      method: 'GET',
      description: '404 Not Found - User not found',
      status: '404',
      testCase: {
        method: 'GET',
        params: {
          wallet: '0x0000000000000000000000000000000000000000',
          role: 'freelancer'
        }
      }
    }
  ],
  '/projects': [
    {
      method: 'POST',
      description: '400 Bad Request - Missing required fields',
      status: '400',
      testCase: {
        method: 'POST',
        body: {
          // Missing required fields
          projectDescription: "Test project description"
        }
      }
    }
  ],
  '/projects/{projectId}': [
    {
      method: 'GET',
      description: '404 Not Found - Project not found',
      status: '404',
      testCase: {
        method: 'GET',
        pathParams: {
          projectId: '00000000-0000-0000-0000-000000000000'
        }
      }
    }
  ],
  '/submissions/create': [
    {
      method: 'POST',
      description: '400 Bad Request - Missing required fields',
      status: '400',
      testCase: {
        method: 'POST',
        body: {
          // Missing required fields
          submissionText: "Test submission"
        }
      }
    }
  ]
};

/**
 * Main function to validate API error documentation
 */
async function validateErrorResponses() {
  console.log('Starting API error documentation validation...');
  console.log(`Using OpenAPI spec: ${OPENAPI_SPEC_PATH}`);
  
  // Read the OpenAPI specification
  const openApiSpec = JSON.parse(fs.readFileSync(OPENAPI_SPEC_PATH, 'utf8'));
  
  // Prepare report
  let report = `# API Error Documentation Validation Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Process each error scenario
  for (const [path, scenarios] of Object.entries(ERROR_SCENARIOS)) {
    report += `## ${path}\n\n`;
    
    for (const scenario of scenarios) {
      report += `### ${scenario.method} - ${scenario.description}\n\n`;
      
      try {
        // Get expected error response from OpenAPI spec
        const expectedError = getExpectedErrorResponse(openApiSpec, path, scenario.method.toLowerCase(), scenario.status);
        
        // Test the error scenario
        const actualError = await testErrorScenario(path, scenario);
        
        // Compare expected vs actual
        const comparisonResult = compareResponses(expectedError, actualError);
        
        if (comparisonResult.match) {
          report += `✅ **Success** - Error response matches documentation\n\n`;
        } else {
          report += `❌ **Discrepancy Found** - ${comparisonResult.message}\n\n`;
        }
        
        report += `#### Expected Error Response\n\`\`\`json\n${JSON.stringify(expectedError, null, 2)}\n\`\`\`\n\n`;
        report += `#### Actual Error Response\n\`\`\`json\n${JSON.stringify(actualError, null, 2)}\n\`\`\`\n\n`;
      } catch (error) {
        report += `❌ **Test Failed**: ${error.message}\n\n`;
      }
      
      report += `---\n\n`;
    }
  }
  
  // Write report to file
  fs.writeFileSync(ERROR_REPORT_PATH, report);
  console.log(`Error validation report generated at: ${ERROR_REPORT_PATH}`);
}

/**
 * Get expected error response from OpenAPI spec
 */
function getExpectedErrorResponse(openApiSpec, path, method, status) {
  const pathObject = openApiSpec.paths[path];
  if (!pathObject) {
    throw new Error(`Path ${path} not found in OpenAPI spec`);
  }
  
  const methodObject = pathObject[method];
  if (!methodObject) {
    throw new Error(`Method ${method} not found for path ${path}`);
  }
  
  const responses = methodObject.responses;
  if (!responses || !responses[status]) {
    throw new Error(`Status ${status} not found in responses for ${method} ${path}`);
  }
  
  const response = responses[status];
  if (!response.content || !response.content['application/json']) {
    return { description: response.description };
  }
  
  // If there's an example, use it
  if (response.content['application/json'].example) {
    return response.content['application/json'].example;
  }
  
  // If there's a schema, try to extract an example
  const schema = response.content['application/json'].schema;
  if (schema) {
    return generateSampleFromSchema(schema, openApiSpec);
  }
  
  return { description: response.description };
}

/**
 * Generate a sample object from a schema
 */
function generateSampleFromSchema(schema, openApiSpec) {
  if (!schema) return null;
  
  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/', '').split('/');
    let refSchema = openApiSpec;
    for (const part of refPath) {
      refSchema = refSchema[part];
    }
    return generateSampleFromSchema(refSchema, openApiSpec);
  }
  
  // Handle oneOf, anyOf, allOf
  if (schema.oneOf) {
    return generateSampleFromSchema(schema.oneOf[0], openApiSpec);
  }
  
  if (schema.anyOf) {
    return generateSampleFromSchema(schema.anyOf[0], openApiSpec);
  }
  
  if (schema.allOf) {
    let result = {};
    for (const subSchema of schema.allOf) {
      Object.assign(result, generateSampleFromSchema(subSchema, openApiSpec));
    }
    return result;
  }
  
  // Handle different types
  switch (schema.type) {
    case 'object':
      const obj = {};
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          obj[propName] = propSchema.example !== undefined ? 
            propSchema.example : 
            generateSampleValue(propSchema, openApiSpec);
        }
      }
      return obj;
    
    case 'array':
      if (schema.items) {
        return [generateSampleValue(schema.items, openApiSpec)];
      }
      return [];
    
    default:
      return generateSampleValue(schema, openApiSpec);
  }
}

/**
 * Generate a sample value based on schema type
 */
function generateSampleValue(schema, openApiSpec) {
  if (!schema) return null;
  
  // Use example if available
  if (schema.example !== undefined) {
    return schema.example;
  }
  
  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/', '').split('/');
    let refSchema = openApiSpec;
    for (const part of refPath) {
      refSchema = refSchema[part];
    }
    return generateSampleValue(refSchema, openApiSpec);
  }
  
  // Handle different types
  switch (schema.type) {
    case 'string':
      if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'uri') return 'https://example.com';
      if (schema.enum) return schema.enum[0];
      return 'sample_string';
    
    case 'number':
    case 'integer':
      return 42;
    
    case 'boolean':
      return true;
    
    case 'object':
      return {};
    
    case 'array':
      return [];
    
    default:
      return null;
  }
}

/**
 * Test an error scenario and return the actual response
 */
async function testErrorScenario(path, scenario) {
  console.log(`Testing error scenario: ${scenario.method} ${path} - ${scenario.description}`);
  
  // If there's a setup step (e.g., create something first), execute it
  if (scenario.testCase.setup) {
    try {
      const setupCommand = buildCurlCommand(
        `${API_BASE_URL}${path}`,
        scenario.testCase.setup.method,
        scenario.testCase.setup.body,
        scenario.testCase.setup.params,
        scenario.testCase.setup.pathParams
      );
      console.log(`Setup: ${setupCommand}`);
      execSync(setupCommand);
    } catch (error) {
      console.log('Setup step failed, but this might be expected');
    }
  }
  
  // Execute the test case
  const testPath = applyPathParams(path, scenario.testCase.pathParams);
  const testCommand = buildCurlCommand(
    `${API_BASE_URL}${testPath}`,
    scenario.testCase.method,
    scenario.testCase.body,
    scenario.testCase.params
  );
  
  console.log(`Test: ${testCommand}`);
  
  try {
    const response = execSync(testCommand).toString();
    return JSON.parse(response);
  } catch (error) {
    // For curl errors that include the response
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout.toString());
      } catch (parseError) {
        console.error('Failed to parse error response:', error.stdout.toString());
      }
    }
    
    throw new Error(`Error executing test command: ${error.message}`);
  }
}

/**
 * Apply path parameters to a path template
 */
function applyPathParams(path, pathParams) {
  if (!pathParams) return path;
  
  let result = path;
  for (const [param, value] of Object.entries(pathParams)) {
    result = result.replace(`{${param}}`, value);
  }
  
  return result;
}

/**
 * Build a curl command for testing the endpoint
 */
function buildCurlCommand(url, method, body, params, pathParams) {
  let command = `curl -X '${method.toUpperCase()}' `;
  
  // Apply path parameters
  if (pathParams) {
    for (const [param, value] of Object.entries(pathParams)) {
      url = url.replace(`{${param}}`, value);
    }
  }
  
  // Add query parameters
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url = `${url}?${queryString}`;
  }
  
  command += `'${url}' `;
  command += `-H 'accept: application/json' `;
  
  // Add request body if applicable
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    command += `-H 'Content-Type: application/json' `;
    command += `-d '${JSON.stringify(body)}'`;
  }
  
  // Add -s (silent) and -o /dev/null to suppress progress output
  command += ' -s ';
  
  // Add -i to include headers in the output (useful for status codes)
  command += ' -i ';
  
  return command;
}

/**
 * Compare expected and actual responses
 */
function compareResponses(expected, actual) {
  if (!expected) {
    return {
      match: false,
      message: 'No expected response defined in OpenAPI spec'
    };
  }
  
  // For now, do a simple structure comparison
  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);
  
  const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
  const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key));
  
  if (missingKeys.length > 0 || extraKeys.length > 0) {
    let message = '';
    
    if (missingKeys.length > 0) {
      message += `Expected keys missing from actual response: ${missingKeys.join(', ')}\n`;
    }
    
    if (extraKeys.length > 0) {
      message += `Extra keys in actual response not in expected response: ${extraKeys.join(', ')}\n`;
    }
    
    return {
      match: false,
      message
    };
  }
  
  return {
    match: true,
    message: 'Response structure matches expected format'
  };
}

// Run the validation
validateErrorResponses().catch(error => {
  console.error('Error validation failed:', error);
}); 