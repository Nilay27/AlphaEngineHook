# LearnLedger API Documentation

This directory contains supplementary documentation for the LearnLedger API.

## Documents

- [API Workarounds](./api-workarounds.md) - Solutions for known API issues and limitations

## Known Issues

### PUT /userProfile Endpoint

There is a known issue with the PUT /userProfile endpoint not properly parsing the request body. This causes 400 errors even when all required fields are included in the request. See the [API Workarounds](./api-workarounds.md) document for a client-side solution until this is fixed on the server.

## Contributing to Documentation

If you find issues or have improvements to suggest for the API documentation, please create a pull request or open an issue in the repository. 