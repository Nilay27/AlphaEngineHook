# API Documentation Validation and Update Tools

This directory contains scripts to validate API documentation against actual API responses and update the documentation accordingly.

## Overview

The tools in this directory help ensure that API documentation in the OpenAPI specification matches the actual behavior of the API. This is crucial for maintaining accurate and reliable documentation for API consumers.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm

## Scripts

### Main script

- `validate-and-update-api-docs.js` - Interactive tool that guides you through the validation and update process

### Individual scripts

- `validate-api-docs.js` - Validates API endpoints against documentation by testing each endpoint and comparing the response with what's documented
- `validate-error-responses.js` - Tests error scenarios to ensure error responses match the documentation
- `update-api-docs.js` - Updates the OpenAPI specification based on actual API responses
- `cleanup-openapi.js` - Removes duplicate OpenAPI specification files and updates script references to use a single file

## Installation

Make sure you have the required Node.js packages installed:

```bash
npm install
```

## Usage

1. Run the main script:

```bash
node scripts/validate-and-update-api-docs.js
```

2. Follow the interactive prompts to validate and update API documentation.

The script provides several options:
- Validate API endpoints against documentation
- Test error responses against documentation
- Update API documentation based on actual responses
- Clean up duplicate OpenAPI files
- Run all validation and update steps
- Exit

Alternatively, you can run individual scripts directly:

```bash
# Validate API endpoints
node scripts/validate-api-docs.js

# Test error responses
node scripts/validate-error-responses.js

# Update API documentation
node scripts/update-api-docs.js

# Clean up duplicate OpenAPI files
node scripts/cleanup-openapi.js
```

## Reports

The scripts generate detailed reports:

- `api-validation-report.md` - Report of API endpoint validation
- `api-error-validation-report.md` - Report of error response validation
- `api-docs-update-report.md` - Report of updates made to the OpenAPI specification

## How It Works

1. **Validation Process**:
   - Reads the OpenAPI specification to identify endpoints and expected responses
   - Makes actual API calls to the endpoints
   - Compares the actual responses with what's documented
   - Generates a report of discrepancies

2. **Error Testing**:
   - Uses predefined test scenarios to trigger error responses
   - Compares the actual error responses with what's documented
   - Generates a report of discrepancies

3. **Update Process**:
   - Makes API calls to endpoints
   - Updates the OpenAPI specification to match the actual responses
   - Generates a report of changes made
   - Creates updated specification files

## Maintaining the OpenAPI Specification

The project uses a **single file approach** for managing the OpenAPI specification:

1. **Single OpenAPI File**: The only OpenAPI specification is located at:
   ```
   project-ledger-docs/static/openapi.json
   ```

2. **Making Changes**:
   - Make changes directly to the primary file (`project-ledger-docs/static/openapi.json`)
   - Use the validation and update tools to ensure the specification is accurate

3. **Validation Workflow**:
   - Make changes to the OpenAPI file
   - Validate the documentation against actual API responses
   - Review the validation report
   - Make additional changes as needed and repeat

This single-file approach simplifies maintenance and ensures there's only one source of truth for API documentation.

## Tips

- **Updating documentation**: After validation, review the reports before applying updates.
- **Error scenarios**: You can add custom error scenarios in `validate-error-responses.js`.
- **Custom endpoints**: Add custom endpoints to test in `update-api-docs.js`. 