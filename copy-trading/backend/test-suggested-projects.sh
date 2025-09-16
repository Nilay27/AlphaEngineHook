#!/bin/bash

# Test script for suggested projects API

# Configuration
API_BASE_URL="http://localhost:3001"
TEST_WALLET_ENS="sattu"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testing Suggested Projects API ===${NC}"

# Test the API endpoint to get suggested projects
echo -e "\n${YELLOW}Testing GET /api/freelancer/suggested endpoint${NC}"
echo -e "GET ${API_BASE_URL}/api/freelancer/suggested?walletEns=${TEST_WALLET_ENS}"

curl -s "${API_BASE_URL}/api/freelancer/suggested?walletEns=${TEST_WALLET_ENS}" \
  -H "Content-Type: application/json" | jq

echo -e "\n${GREEN}Test completed.${NC}"
echo -e "You can also run this command directly in your terminal:"
echo -e "${YELLOW}curl -s \"${API_BASE_URL}/api/freelancer/suggested?walletEns=${TEST_WALLET_ENS}\" -H \"Content-Type: application/json\" | jq${NC}" 