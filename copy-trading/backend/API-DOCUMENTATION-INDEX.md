# LearnLedger API Documentation

Welcome to the LearnLedger API documentation. This documentation is designed to help frontend developers integrate with our backend services.

## Documentation Files

1. [**API Reference**](API-DOCUMENTATION-NEW.md) - Complete API specification with endpoints, parameters, and responses
2. [**Implementation Examples**](API-DOCUMENTATION-EXAMPLES.md) - Practical code examples for frontend integration
3. [Interactive API Documentation](#interactive-api-docs) - Browser-based tools for testing API endpoints

## Interactive API Docs

For an interactive experience where you can test API endpoints directly in your browser:

- **Swagger UI**: `/api/docs`
- **OpenAPI Specification**: `/api/api-spec`

## Getting Started

To start using the LearnLedger API:

1. Connect your Metamask wallet
2. Register a user profile (company or freelancer)
3. Begin using the API endpoints as documented

## Authentication 

Most API endpoints require authentication using your Metamask wallet address. All protected endpoints will verify that the wallet address provided matches an authorized user in our system.

## Common Response Format

All API responses follow a consistent JSON format:

```json
{
  "isSuccess": true|false,
  "message": "Human-readable message",
  "data": {...} | [...] | null
}
```

## Error Handling

When errors occur, responses include helpful messages and field-specific errors:

```json
{
  "isSuccess": false,
  "message": "Error message",
  "errors": {
    "fieldName": ["Error message for this field"]
  }
}
```

## Need Help?

If you need assistance with the API:

- Review the complete [API Reference](API-DOCUMENTATION-NEW.md)
- Check the [Implementation Examples](API-DOCUMENTATION-EXAMPLES.md) 
- Test endpoints using the interactive documentation at `/api/docs`
- Contact our development team if you encounter persistent issues

---

**Last Updated**: [Current Date] 