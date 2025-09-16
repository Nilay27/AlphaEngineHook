import { NextRequest } from 'next/server';
import { withCors } from '@/lib/cors';

/**
 * GET /api/debug/cors-test
 * 
 * Serves an HTML page with a client-side CORS test utility
 * that helps diagnose any CORS issues.
 */
async function corsTestPage(req: NextRequest) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CORS Test Utility</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.5;
    }
    h1, h2 {
      color: #333;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    input[type="text"], input[type="url"], select {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      background-color: #0070f3;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #0056b3;
    }
    .response {
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 16px;
      margin-top: 16px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .success {
      color: #28a745;
    }
    .error {
      color: #dc3545;
    }
    .warning {
      color: #ffc107;
    }
    .cors-header {
      font-weight: bold;
      color: #0070f3;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 16px;
    }
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .tab.active {
      border: 1px solid #ddd;
      border-bottom: 1px solid white;
      border-radius: 4px 4px 0 0;
      margin-bottom: -1px;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <h1>CORS Test Utility</h1>
  <p>Use this tool to diagnose CORS issues between your frontend and API endpoints.</p>
  
  <div class="tabs">
    <div class="tab active" data-tab="test">Test Endpoint</div>
    <div class="tab" data-tab="debug">Debug Info</div>
    <div class="tab" data-tab="help">Help & Reference</div>
  </div>
  
  <div class="tab-content active" id="test-tab">
    <div class="card">
      <h2>Test API Endpoint</h2>
      <div>
        <label for="api-url">API URL:</label>
        <input type="url" id="api-url" placeholder="http://localhost:3001/api/company/my-projects?walletEns=consentsam" value="">
      </div>
      <div>
        <label for="method">HTTP Method:</label>
        <select id="method">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
      </div>
      <div>
        <label for="request-body">Request Body (JSON):</label>
        <textarea id="request-body" rows="4" style="width: 100%;" placeholder='{"key": "value"}'></textarea>
      </div>
      <div>
        <label>
          <input type="checkbox" id="include-credentials" checked> 
          Include Credentials (for cookies/auth)
        </label>
      </div>
      <button id="test-btn">Test Endpoint</button>
      <button id="preflight-btn">Test Preflight (OPTIONS)</button>
      
      <div id="response-container" style="display: none;">
        <h3>Response:</h3>
        <div class="response" id="response-output"></div>
        
        <h3>Headers:</h3>
        <div class="response" id="headers-output"></div>
        
        <h3>CORS Analysis:</h3>
        <div class="response" id="cors-analysis"></div>
      </div>
    </div>
  </div>
  
  <div class="tab-content" id="debug-tab">
    <div class="card">
      <h2>Debug Current Configuration</h2>
      <p>This will call the /api/debug/cors endpoint to see current CORS configuration.</p>
      <button id="debug-btn">Get Debug Info</button>
      <div id="debug-container" style="display: none;">
        <h3>Debug Information:</h3>
        <div class="response" id="debug-output"></div>
      </div>
    </div>
  </div>
  
  <div class="tab-content" id="help-tab">
    <div class="card">
      <h2>Common CORS Issues</h2>
      <ul>
        <li><strong>Missing Access-Control-Allow-Origin</strong>: The API server must include this header with either your origin or "*"</li>
        <li><strong>Credentials with wildcard origin</strong>: When using credentials, the Access-Control-Allow-Origin cannot be "*", it must be a specific origin</li>
        <li><strong>Missing Access-Control-Allow-Methods</strong>: For non-simple requests (PUT, DELETE, etc.), this header must include the method being used</li>
        <li><strong>Missing Access-Control-Allow-Headers</strong>: If you're sending custom headers, they must be explicitly allowed</li>
        <li><strong>Preflight failure</strong>: For non-simple requests, browsers send an OPTIONS request first. This must respond with proper CORS headers</li>
      </ul>
      
      <h2>Reference</h2>
      <p>For more information about CORS, visit <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS" target="_blank">MDN Web Docs: CORS</a></p>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Set a default API URL based on the current host
      const host = window.location.host;
      const protocol = window.location.protocol;
      document.getElementById('api-url').value = \`\${protocol}//\${host}/api/debug/cors\`;
      
      // Tab switching
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs and content
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          
          // Add active class to clicked tab
          this.classList.add('active');
          
          // Show corresponding content
          const tabId = this.getAttribute('data-tab');
          document.getElementById(\`\${tabId}-tab\`).classList.add('active');
        });
      });
      
      // Test button click handler
      document.getElementById('test-btn').addEventListener('click', async function() {
        const url = document.getElementById('api-url').value;
        const method = document.getElementById('method').value;
        const requestBody = document.getElementById('request-body').value;
        const includeCredentials = document.getElementById('include-credentials').checked;
        
        if (!url) {
          alert('Please enter an API URL');
          return;
        }
        
        try {
          const options = {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: includeCredentials ? 'include' : 'omit'
          };
          
          if (method !== 'GET' && method !== 'HEAD' && requestBody) {
            try {
              options.body = requestBody;
            } catch (e) {
              alert('Invalid JSON in request body');
              return;
            }
          }
          
          const startTime = performance.now();
          const response = await fetch(url, options);
          const endTime = performance.now();
          
          const responseText = await response.text();
          let responseJson = null;
          
          try {
            if (responseText) {
              responseJson = JSON.parse(responseText);
            }
          } catch (e) {
            // Not JSON, use text response
          }
          
          const headers = {};
          response.headers.forEach((value, name) => {
            headers[name] = value;
          });
          
          // Show response container
          document.getElementById('response-container').style.display = 'block';
          
          // Display response 
          document.getElementById('response-output').innerHTML = \`
            <div>Status: <strong>\${response.status} \${response.statusText}</strong></div>
            <div>Time: <strong>\${(endTime - startTime).toFixed(2)}ms</strong></div>
            <div>Response:</div>
            <pre>\${responseJson ? JSON.stringify(responseJson, null, 2) : responseText}</pre>
          \`;
          
          // Display headers
          const headersHtml = Object.entries(headers).map(([key, value]) => {
            if (key.toLowerCase().startsWith('access-control')) {
              return \`<div><span class="cors-header">\${key}</span>: \${value}</div>\`;
            }
            return \`<div><strong>\${key}</strong>: \${value}</div>\`;
          }).join('');
          
          document.getElementById('headers-output').innerHTML = headersHtml || 'No headers received';
          
          // Analyze CORS
          const corsAnalysis = analyzeCorsHeaders(headers, includeCredentials);
          document.getElementById('cors-analysis').innerHTML = corsAnalysis;
        } catch (error) {
          document.getElementById('response-container').style.display = 'block';
          document.getElementById('response-output').innerHTML = \`
            <div class="error">
              <strong>Error:</strong> \${error.message}
            </div>
            <div>
              <p>This is likely a CORS error. Check the browser console for more details.</p>
            </div>
          \`;
          document.getElementById('headers-output').innerHTML = 'No headers received due to CORS error';
          document.getElementById('cors-analysis').innerHTML = generateCorsErrorHelp(error);
        }
      });
      
      // Preflight test button
      document.getElementById('preflight-btn').addEventListener('click', async function() {
        const url = document.getElementById('api-url').value;
        if (!url) {
          alert('Please enter an API URL');
          return;
        }
        
        try {
          const response = await fetch(url, {
            method: 'OPTIONS',
            headers: {
              'Access-Control-Request-Method': document.getElementById('method').value,
              'Access-Control-Request-Headers': 'content-type, authorization'
            }
          });
          
          const headers = {};
          response.headers.forEach((value, name) => {
            headers[name] = value;
          });
          
          // Show response container
          document.getElementById('response-container').style.display = 'block';
          
          // Display response
          document.getElementById('response-output').innerHTML = \`
            <div>Status: <strong>\${response.status} \${response.statusText}</strong></div>
            <div>Preflight OPTIONS request</div>
          \`;
          
          // Display headers
          const headersHtml = Object.entries(headers).map(([key, value]) => {
            if (key.toLowerCase().startsWith('access-control')) {
              return \`<div><span class="cors-header">\${key}</span>: \${value}</div>\`;
            }
            return \`<div><strong>\${key}</strong>: \${value}</div>\`;
          }).join('');
          
          document.getElementById('headers-output').innerHTML = headersHtml || 'No headers received';
          
          // Analyze CORS preflight
          const corsAnalysis = analyzePreflightHeaders(headers, document.getElementById('method').value);
          document.getElementById('cors-analysis').innerHTML = corsAnalysis;
        } catch (error) {
          document.getElementById('response-container').style.display = 'block';
          document.getElementById('response-output').innerHTML = \`
            <div class="error">
              <strong>Error:</strong> \${error.message}
            </div>
            <div>
              <p>Failed to perform preflight request. Check the browser console for more details.</p>
            </div>
          \`;
          document.getElementById('headers-output').innerHTML = 'No headers received due to error';
          document.getElementById('cors-analysis').innerHTML = generateCorsErrorHelp(error);
        }
      });
      
      // Debug button click handler
      document.getElementById('debug-btn').addEventListener('click', async function() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const url = \`\${protocol}//\${host}/api/debug/cors\`;
        
        try {
          const response = await fetch(url, {
            credentials: 'include'
          });
          
          const responseJson = await response.json();
          
          // Show debug container
          document.getElementById('debug-container').style.display = 'block';
          
          // Display debug info
          document.getElementById('debug-output').innerHTML = \`
            <pre>\${JSON.stringify(responseJson, null, 2)}</pre>
          \`;
        } catch (error) {
          document.getElementById('debug-container').style.display = 'block';
          document.getElementById('debug-output').innerHTML = \`
            <div class="error">
              <strong>Error:</strong> \${error.message}
            </div>
            <div>
              <p>Failed to get debug info. Check the browser console for more details.</p>
            </div>
          \`;
        }
      });
      
      function analyzeCorsHeaders(headers, includeCredentials) {
        const issues = [];
        const successes = [];
        
        const origin = window.location.origin;
        
        // Check Access-Control-Allow-Origin
        const allowOrigin = headers['access-control-allow-origin'];
        if (!allowOrigin) {
          issues.push('<div class="error">Missing Access-Control-Allow-Origin header</div>');
        } else if (allowOrigin === '*' && includeCredentials) {
          issues.push('<div class="error">Access-Control-Allow-Origin is set to * (wildcard) but credentials are included. This is not allowed.</div>');
        } else if (allowOrigin !== '*' && allowOrigin !== origin) {
          issues.push(\`<div class="error">Access-Control-Allow-Origin (\${allowOrigin}) does not match the current origin (\${origin})</div>\`);
        } else {
          successes.push(\`<div class="success">Access-Control-Allow-Origin is correctly set to \${allowOrigin}</div>\`);
        }
        
        // Check Access-Control-Allow-Credentials
        if (includeCredentials) {
          const allowCredentials = headers['access-control-allow-credentials'];
          if (!allowCredentials) {
            issues.push('<div class="error">Credentials are included but Access-Control-Allow-Credentials header is missing</div>');
          } else if (allowCredentials.toLowerCase() !== 'true') {
            issues.push('<div class="error">Access-Control-Allow-Credentials must be "true" when credentials are included</div>');
          } else {
            successes.push('<div class="success">Access-Control-Allow-Credentials is correctly set to true</div>');
          }
        }
        
        // General check
        if (issues.length === 0) {
          return \`
            <div class="success">✅ No CORS issues detected with this endpoint!</div>
            \${successes.join('')}
          \`;
        } else {
          return \`
            <div class="error">⚠️ CORS issues detected:</div>
            \${issues.join('')}
            \${successes.length > 0 ? '<div class="success">✅ Successful checks:</div>' + successes.join('') : ''}
          \`;
        }
      }
      
      function analyzePreflightHeaders(headers, requestMethod) {
        const issues = [];
        const successes = [];
        
        const origin = window.location.origin;
        
        // Check Access-Control-Allow-Origin
        const allowOrigin = headers['access-control-allow-origin'];
        if (!allowOrigin) {
          issues.push('<div class="error">Missing Access-Control-Allow-Origin header in preflight response</div>');
        } else if (allowOrigin !== '*' && allowOrigin !== origin) {
          issues.push(\`<div class="error">Access-Control-Allow-Origin (\${allowOrigin}) does not match the current origin (\${origin})</div>\`);
        } else {
          successes.push(\`<div class="success">Access-Control-Allow-Origin is correctly set to \${allowOrigin}</div>\`);
        }
        
        // Check Access-Control-Allow-Methods
        const allowMethods = headers['access-control-allow-methods'];
        if (!allowMethods) {
          issues.push('<div class="error">Missing Access-Control-Allow-Methods header in preflight response</div>');
        } else if (!allowMethods.split(',').map(m => m.trim()).includes(requestMethod)) {
          issues.push(\`<div class="error">Requested method \${requestMethod} is not included in Access-Control-Allow-Methods</div>\`);
        } else {
          successes.push('<div class="success">Access-Control-Allow-Methods includes the requested method</div>');
        }
        
        // Check Access-Control-Allow-Headers
        const allowHeaders = headers['access-control-allow-headers'];
        if (!allowHeaders) {
          issues.push('<div class="error">Missing Access-Control-Allow-Headers header in preflight response</div>');
        } else {
          const allowedHeaders = allowHeaders.toLowerCase().split(',').map(h => h.trim());
          const requiredHeaders = ['content-type', 'authorization'];
          
          const missingHeaders = requiredHeaders.filter(h => !allowedHeaders.includes(h));
          
          if (missingHeaders.length > 0) {
            issues.push(\`<div class="error">Required headers not allowed: \${missingHeaders.join(', ')}</div>\`);
          } else {
            successes.push('<div class="success">Access-Control-Allow-Headers includes all required headers</div>');
          }
        }
        
        // Check Access-Control-Max-Age (optional)
        const maxAge = headers['access-control-max-age'];
        if (maxAge) {
          successes.push(\`<div class="success">Access-Control-Max-Age is set to \${maxAge} seconds</div>\`);
        }
        
        // General check
        if (issues.length === 0) {
          return \`
            <div class="success">✅ Preflight request successful!</div>
            \${successes.join('')}
          \`;
        } else {
          return \`
            <div class="error">⚠️ Preflight issues detected:</div>
            \${issues.join('')}
            \${successes.length > 0 ? '<div class="success">✅ Successful checks:</div>' + successes.join('') : ''}
          \`;
        }
      }
      
      function generateCorsErrorHelp(error) {
        return \`
          <div class="error">
            <strong>CORS Error Detected</strong>
            <p>The browser blocked the request due to a Cross-Origin Resource Sharing (CORS) policy violation.</p>
            <p>Common causes:</p>
            <ul>
              <li>The server doesn't include the proper <code>Access-Control-Allow-Origin</code> header</li>
              <li>If using credentials, the server must set <code>Access-Control-Allow-Credentials: true</code></li>
              <li>For non-simple requests, the preflight OPTIONS request is failing</li>
              <li>The API server might be down or unreachable</li>
            </ul>
            <p>Try the following:</p>
            <ul>
              <li>Check that the API server is running and accessible</li>
              <li>Click the "Test Preflight" button to test the OPTIONS request</li>
              <li>Click the "Debug Info" tab to get more information about your current configuration</li>
              <li>Check the browser developer console for more detailed error messages</li>
            </ul>
          </div>
        \`;
      }
    });
  </script>
</body>
</html>
  `;

  // Return the HTML page
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

// Export the handler wrapped with CORS
export const GET = withCors(corsTestPage); 