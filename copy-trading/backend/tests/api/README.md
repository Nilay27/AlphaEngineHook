# API Tests

This directory contains tests for the LearnLedger API endpoints. These tests verify that the API functions correctly after removing the EIP authentication.

## Test Structure

- `setup.ts` - Common setup and utilities for all API tests, including mock API implementations
- `register.test.ts` - Tests for the registration API
- `projects.test.ts` - Tests for the projects API
- `userProfile.test.ts` - Tests for the user profile API
- `submissions.test.ts` - Tests for the submissions API

## Mock Implementation

By default, the tests use a mock implementation of the API instead of making real HTTP requests. This allows you to run the tests without having a real server running. The mock implementation is controlled by the `USE_MOCKS` flag in `setup.ts`. Set this to `false` if you want to test against a real server.

The mock implementation:
- Uses an in-memory data store to simulate the database
- Implements all the API endpoints that were modified when removing EIP authentication
- Validates request parameters and returns appropriate responses
- Maintains data consistency between endpoints (e.g., a created project can be retrieved)

## Running Tests

### Prerequisites

1. Make sure you have the Node.js packages installed:
   ```
   npm install
   ```

2. If testing against a real server (with `USE_MOCKS=false`), ensure your development server is running:
   ```
   npm run dev
   ```

### Running Tests

You can run all tests together:

```
npm run test:api
```

Or use the provided shell script:

```
./tests/api/run-tests.sh
```

To run specific test files:

```
npx jest tests/api/register.test.ts
npx jest tests/api/projects.test.ts
npx jest tests/api/userProfile.test.ts
npx jest tests/api/submissions.test.ts
```

## Test Wallet Addresses

The tests use the following test wallet addresses:

- Company: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Freelancer: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- User: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`

These addresses are defined in `setup.ts` and can be modified as needed.

## Toggling Between Mock and Real Testing

In `setup.ts`, you can change the `USE_MOCKS` constant to control whether to use the mock implementation or make real HTTP requests:

```typescript
// Flag to control whether to use mock responses
const USE_MOCKS = true; // Set to false to test against a real server
```

When using real HTTP requests, make sure:
1. Your server is running
2. The `BASE_URL` in `setup.ts` points to your server
3. The database is properly set up with test data or will accept the test data created during the tests

## Notes

1. The tests assume a development environment where test data can be created and deleted.
2. Some tests build on each other (e.g., creating a project before testing submissions).
3. The cleanup function is a placeholder - in a real environment, you might want to implement proper cleanup logic.
4. The tests do not include signature verification since the EIP authentication has been removed. 