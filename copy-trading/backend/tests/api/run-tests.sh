#!/bin/bash

# Run all API tests
echo "Running all API tests..."
echo "========================="

# Make sure environment variables are loaded
if [ -f .env.local ]; then
  echo "Loading environment from .env.local..."
  export $(grep -v '^#' .env.local | xargs)
fi

# Test each file individually
echo "Testing registration API..."
npx jest tests/api/register.test.ts

echo "Testing projects API..."
npx jest tests/api/projects.test.ts

echo "Testing user profile API..."
npx jest tests/api/userProfile.test.ts

echo "Testing submissions API..."
npx jest tests/api/submissions.test.ts

# Or run all tests at once
# echo "Running all tests together..."
# npx jest tests/api

echo "========================="
echo "API testing completed!" 