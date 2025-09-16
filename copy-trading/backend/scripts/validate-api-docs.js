// validate-api-docs.js
// This script validates API documentation against actual API responses

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

// Configuration
const API_BASE_URL = 'https://learn-ledger-api.vercel.app/api';
const OPENAPI_SPEC_PATH = path.join(__dirname, '../project-ledger-docs/static/openapi.json');
const REPORT_PATH = path.join(__dirname, '../api-validation-report.md');

/**
 * Main function to validate API documentation
 */
async function validateApiDocs() {
  console.log('Starting API documentation validation...');
  console.log(`Using OpenAPI spec: ${OPENAPI_SPEC_PATH}`);
  
  // Read the OpenAPI specification
  const openApiSpec = JSON.parse(fs.readFileSync(OPENAPI_SPEC_PATH, 'utf8'));
  
  // Prepare report
  let report = `# API Documentation Validation Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Process each path in the OpenAPI spec
  const paths = openApiSpec.paths;
  const pathKeys = Object.keys(paths);
  
  console.log(`Found ${pathKeys.length} API paths to validate.`);
  
  for (const pathKey of pathKeys) {
    const pathItem = paths[pathKey];
    const methods = Object.keys(pathItem).filter(key => ['get', 'post', 'put', 'delete', 'patch'].includes(key.toLowerCase()));
    
    for (const method of methods) {
      const operation = pathItem[method];
      
      report += `## ${method.toUpperCase()} ${pathKey}\n\n`;
      report += `Operation ID: \`${operation.operationId || 'Not specified'}\`\n\n`;
      
      // Test this endpoint
      try {
        const testResult = await testEndpoint(pathKey, method, operation);
        report += `### Results\n\n`;
        
        if (testResult.success) {
          report += `✅ **Success**\n\n`;
        } else {
          report += `❌ **Discrepancy Found**\n\n`;
        }
        
        report += `${testResult.message}\n\n`;
        
        if (testResult.expected && testResult.actual) {
          report += `#### Expected Response\n\`\`\`json\n${JSON.stringify(testResult.expected, null, 2)}\n\`\`\`\n\n`;
          report += `#### Actual Response\n\`\`\`json\n${JSON.stringify(testResult.actual, null, 2)}\n\`\`\`\n\n`;
        }
        
        // Add test cases for error responses if defined
        if (operation.responses) {
          const errorCodes = Object.keys(operation.responses).filter(code => code !== '200');
          
          if (errorCodes.length > 0) {
            report += `### Error Response Tests\n\n`;
            
            for (const errorCode of errorCodes) {
              report += `#### ${errorCode} Response\n\n`;
              
              // For now, just document that this should be tested
              report += `⚠️ Manual testing required for ${errorCode} response\n\n`;
            }
          }
        }
      } catch (error) {
        report += `### Error\n\n`;
        report += `❌ **Test Failed**: ${error.message}\n\n`;
      }
      
      report += `---\n\n`;
    }
  }
  
  // Write report to file
  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at: ${REPORT_PATH}`);
}

/**
 * Test a specific endpoint and compare with expected response
 * @param {string} path - API path
 * @param {string} method - HTTP method
 * @param {object} operation - Operation details from OpenAPI spec
 */
async function testEndpoint(path, method, operation) {
  try {
    console.log(`Testing ${method.toUpperCase()} ${path}...`);
    
    // Generate request body if this is a POST or PUT request
    const body = (method === 'post' || method === 'put') ? getRequestBody(operation) : null;
    
    // Generate query parameters
    const params = getQueryParams(path, operation);
    
    // Special handling for endpoints that require specific parameters
    if (path === '/userProfile' && method === 'get') {
      params.wallet = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      params.role = 'company';
    }
    
    // Build and execute the curl command
    const url = `${API_BASE_URL}${path}`;
    const curlCommand = buildCurlCommand(method, url, body, params);
    
    console.log(`Executing: ${curlCommand}`);
    
    // Execute curl command and capture response
    const response = execSync(curlCommand).toString();
    const actualResponse = JSON.parse(response);
    
    // Extract expected response from OpenAPI spec
    const expectedResponse = getExpectedResponse(operation);
    
    // Compare actual vs expected
    const comparisonResult = compareResponses(expectedResponse, actualResponse);
    
    return {
      success: comparisonResult.match,
      message: comparisonResult.message,
      expected: expectedResponse,
      actual: actualResponse
    };
  } catch (error) {
    console.error(`Error testing endpoint: ${error.message}`);
    return {
      success: false,
      message: `Failed to test endpoint: ${error.message}`
    };
  }
}

/**
 * Build a curl command for testing the endpoint
 */
function buildCurlCommand(method, url, body, params) {
  let command = `curl -X '${method.toUpperCase()}' `;
  
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
  
  return command;
}

/**
 * Extract request body from OpenAPI operation
 */
function getRequestBody(operation) {
  if (!operation.requestBody) return null;
  
  const content = operation.requestBody.content;
  if (!content || !content['application/json']) return null;
  
  const schema = content['application/json'].schema;
  
  // If there's an example value, use it
  if (content['application/json'].example) {
    return content['application/json'].example;
  }
  
  // Otherwise, try to generate a sample based on the schema
  return generateSampleFromSchema(schema);
}

/**
 * Extract query parameters from OpenAPI operation
 */
function getQueryParams(path, operation) {
  if (!operation.parameters) return {};
  
  const queryParams = operation.parameters.filter(param => param.in === 'query');
  const result = {};
  
  for (const param of queryParams) {
    // Use example value if available
    if (param.example) {
      result[param.name] = param.example;
    } else if (param.schema && param.schema.example) {
      result[param.name] = param.schema.example;
    } else {
      // Generate a sample value based on the schema
      result[param.name] = generateSampleValue(param.schema);
    }
  }
  
  return result;
}

/**
 * Extract expected response from OpenAPI operation
 */
function getExpectedResponse(operation) {
  if (!operation.responses || !operation.responses['200']) return null;
  
  const response = operation.responses['200'];
  if (!response.content || !response.content['application/json']) return null;
  
  const schema = response.content['application/json'].schema;
  
  // If there's an example, use it
  if (response.content['application/json'].example) {
    return response.content['application/json'].example;
  }
  
  // Otherwise, try to generate a sample based on the schema
  return generateSampleFromSchema(schema);
}

/**
 * Generate a sample object from a schema
 */
function generateSampleFromSchema(schema) {
  if (!schema) return null;
  
  // Handle $ref
  if (schema.$ref) {
    // For now, just return a placeholder
    return { $ref: schema.$ref };
  }
  
  // Handle different types
  switch (schema.type) {
    case 'object':
      const obj = {};
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          obj[propName] = propSchema.example || generateSampleValue(propSchema);
        }
      }
      return obj;
    
    case 'array':
      if (schema.items) {
        return [generateSampleValue(schema.items)];
      }
      return [];
    
    default:
      return generateSampleValue(schema);
  }
}

/**
 * Generate a sample value based on schema type
 */
function generateSampleValue(schema) {
  if (!schema) return null;
  
  // Use example if available
  if (schema.example !== undefined) {
    return schema.example;
  }
  
  // Handle different types
  switch (schema.type) {
    case 'string':
      if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'uri') return 'https://example.com';
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
  // In a real implementation, this would be more sophisticated
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
validateApiDocs().catch(error => {
  console.error('Validation failed:', error);
}); 