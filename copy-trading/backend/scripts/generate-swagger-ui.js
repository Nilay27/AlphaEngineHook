// scripts/generate-swagger-ui.js
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-dist');
const { createSwaggerSpec } = require('next-swagger-doc');

// Import your OpenAPI schema
const apiSchema = require('../lib/openapi').apiSchema;

// Output directory
const outputDir = path.join(__dirname, '../out/api-docs');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy Swagger UI assets
const swaggerUiAssetDir = swaggerUi.getAbsoluteFSPath();
const assets = fs.readdirSync(swaggerUiAssetDir);

assets.forEach(asset => {
  // Skip directories and non-essential files
  if (fs.lstatSync(path.join(swaggerUiAssetDir, asset)).isDirectory()) return;
  if (asset === 'index.html') return; // We'll create our own

  fs.copyFileSync(
    path.join(swaggerUiAssetDir, asset),
    path.join(outputDir, asset)
  );
});

// Create index.html with our OpenAPI spec
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>LearnLedger API Documentation</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
  <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
  <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(apiSchema)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);

console.log('Static Swagger UI generated at:', outputDir); 