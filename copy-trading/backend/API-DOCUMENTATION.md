# LearnLedger API Documentation

This documentation provides comprehensive information about the LearnLedger API.

## Interactive Documentation

For an interactive experience where you can try out API endpoints directly, open `api-docs/index.html` in your browser.

## API Specification

The complete API specification is available as an OpenAPI 3.0 specification in the `api-spec.json` file. This can be imported into tools like:

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [SwaggerHub](https://swagger.io/tools/swaggerhub/)
- Any other tool that supports OpenAPI 3.0

## Base URLs

- Production API: `https://LearnLedger.vercel.app/api`
- Development API: `http://localhost:3000/api`

## Authentication

The API uses Metamask wallet addresses for authentication. Most endpoints require a valid wallet address to be provided.

## Common Response Format

All API endpoints follow a consistent response format:

```json
{
  "isSuccess": true|false,
  "message": "Human-readable message",
  "data": { ... } | [ ... ] | null
}
```

## Error Handling

Errors follow a consistent format:

```json
{
  "isSuccess": false,
  "message": "Error message",
  "errors": {
    "fieldName": ["Error message for this field"]
  }
}
```

## Getting Started

To begin integrating with our API:

1. Browse the interactive documentation to understand available endpoints
2. Import the API specification into your preferred API client
3. Test endpoints using the "Try it out" feature
4. Implement the needed API calls in your frontend code

## Need Help?

If you encounter any issues or have questions about the API:

- Check the example requests and responses in the documentation
- Review the error messages for specific fields
- Contact the API development team for further assistance 