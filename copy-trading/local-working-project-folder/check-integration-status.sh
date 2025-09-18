#!/bin/bash

# ============================================
# AlphaEngine Integration Status Checker
# Version: 1.0.0
# Created: 17-September-2025
#
# This script checks the status of all integration points
# and validates dependencies across teams
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.shared"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    AlphaEngine Integration Status Check${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $2 missing"
        return 1
    fi
}

# Function to check environment variable
check_env() {
    if [ -f "$ENV_FILE" ]; then
        VALUE=$(grep "^$1=" "$ENV_FILE" | cut -d '=' -f2)
        if [ -n "$VALUE" ] && [ "$VALUE" != "" ]; then
            echo -e "${GREEN}✓${NC} $2: $VALUE"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $2: Not set"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} .env.shared file not found"
        return 1
    fi
}

# Function to check if port is listening
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${GREEN}✓${NC} $2 is running on port $1"
        return 0
    else
        echo -e "${RED}✗${NC} $2 is not running on port $1"
        return 1
    fi
}

# Function to check API endpoint
check_api() {
    if curl -f -s "$1" > /dev/null; then
        echo -e "${GREEN}✓${NC} $2 is responding"
        return 0
    else
        echo -e "${RED}✗${NC} $2 is not responding"
        return 1
    fi
}

# ============================================
# 1. Check Branch Status
# ============================================
echo -e "${YELLOW}1. Branch Status${NC}"
echo "-------------------"

CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${BLUE}$CURRENT_BRANCH${NC}"

# Check if feature branches exist
for branch in "feature/backend-fhe-subscription" "feature/frontend-subscription-ui" "feature/smart-contracts-fhe"; do
    if git show-ref --verify --quiet refs/heads/$branch; then
        echo -e "${GREEN}✓${NC} $branch exists"
    else
        echo -e "${YELLOW}⚠${NC} $branch not found locally"
    fi
done

echo ""

# ============================================
# 2. Check Shared Configuration
# ============================================
echo -e "${YELLOW}2. Shared Configuration${NC}"
echo "------------------------"

check_file "$ENV_FILE" "Shared environment file"

if [ -f "$ENV_FILE" ]; then
    # Check critical environment variables
    check_env "CHAIN_ID" "Chain ID"
    check_env "ALPHAENGINE_CONTRACT_ADDRESS" "Contract Address"
    check_env "API_BASE_URL" "API Base URL"
    check_env "DATABASE_URL" "Database URL"
fi

echo ""

# ============================================
# 3. Check Smart Contract Status
# ============================================
echo -e "${YELLOW}3. Smart Contract Status${NC}"
echo "-------------------------"

# Check if contract files exist
check_file "contracts/AlphaEngineSubscription.sol" "Main contract"
check_file "contracts/FHEAddressEncryption.sol" "FHE library"
check_file "scripts/deploy.js" "Deployment script"

# Check if contracts are compiled
if [ -d "artifacts/contracts" ]; then
    echo -e "${GREEN}✓${NC} Contracts compiled"
else
    echo -e "${RED}✗${NC} Contracts not compiled"
fi

# Check deployment status from env
if [ -f "$ENV_FILE" ]; then
    check_env "ALPHAENGINE_CONTRACT_ADDRESS" "Deployment address"
    check_env "DEPLOYMENT_BLOCK_NUMBER" "Deployment block"
fi

echo ""

# ============================================
# 4. Check Backend Status
# ============================================
echo -e "${YELLOW}4. Backend Status${NC}"
echo "------------------"

# Check if backend files exist
check_file "backend/package.json" "Backend package.json"
check_file "backend/db/schema/address-mappings-schema.ts" "Address mappings schema"
check_file "backend/src/services/encryption.service.ts" "Encryption service"

# Check if backend is running
check_port $BACKEND_PORT "Backend server"

# Check API health
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    check_api "http://localhost:$BACKEND_PORT/health" "Health endpoint"
    check_api "http://localhost:$BACKEND_PORT/api/v1/alpha-generators" "Generators API"
fi

# Check database connection
if command -v psql &> /dev/null; then
    if psql -U alphaengine -d alphaengine -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Database connection successful"
    else
        echo -e "${YELLOW}⚠${NC} Database connection failed"
    fi
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL client not installed"
fi

echo ""

# ============================================
# 5. Check Frontend Status
# ============================================
echo -e "${YELLOW}5. Frontend Status${NC}"
echo "-------------------"

# Check if frontend files exist
check_file "frontend/package.json" "Frontend package.json"
check_file "frontend/src/utils/api-client.ts" "API client"
check_file "frontend/src/hooks/use-alpha-engine.ts" "AlphaEngine hook"
check_file "frontend/src/components/AlphaEngine/GeneratorList.tsx" "Generator list component"

# Check if frontend is running
check_port $FRONTEND_PORT "Frontend server"

# Check build
if [ -d "frontend/.next" ]; then
    echo -e "${GREEN}✓${NC} Frontend built"
else
    echo -e "${YELLOW}⚠${NC} Frontend not built"
fi

echo ""

# ============================================
# 6. Check Integration Gates
# ============================================
echo -e "${YELLOW}6. Integration Gates${NC}"
echo "---------------------"

if [ -f "$ENV_FILE" ]; then
    # Check Gate 1 - Contract Deployment
    GATE_1=$(grep "^GATE_1_CONTRACT_DEPLOYMENT=" "$ENV_FILE" | cut -d '=' -f2)
    if [ "$GATE_1" = "completed" ]; then
        echo -e "${GREEN}✓${NC} Gate 1 (Contract Deployment): COMPLETED"
        GATE_1_TIME=$(grep "^GATE_1_COMPLETED_AT=" "$ENV_FILE" | cut -d '=' -f2)
        if [ -n "$GATE_1_TIME" ]; then
            echo "  Completed at: $GATE_1_TIME"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Gate 1 (Contract Deployment): PENDING"
    fi

    # Check Gate 2 - API Ready
    GATE_2=$(grep "^GATE_2_API_READY=" "$ENV_FILE" | cut -d '=' -f2)
    if [ "$GATE_2" = "completed" ]; then
        echo -e "${GREEN}✓${NC} Gate 2 (API Ready): COMPLETED"
        GATE_2_TIME=$(grep "^GATE_2_COMPLETED_AT=" "$ENV_FILE" | cut -d '=' -f2)
        if [ -n "$GATE_2_TIME" ]; then
            echo "  Completed at: $GATE_2_TIME"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Gate 2 (API Ready): PENDING"
    fi
fi

echo ""

# ============================================
# 7. Check Test Status
# ============================================
echo -e "${YELLOW}7. Test Status${NC}"
echo "---------------"

# Backend tests
if [ -d "backend" ]; then
    cd backend
    if npm run test 2>/dev/null | grep -q "PASS"; then
        echo -e "${GREEN}✓${NC} Backend tests passing"
    else
        echo -e "${YELLOW}⚠${NC} Backend tests not run or failing"
    fi
    cd ..
fi

# Frontend tests
if [ -d "frontend" ]; then
    cd frontend
    if npm run test 2>/dev/null | grep -q "PASS"; then
        echo -e "${GREEN}✓${NC} Frontend tests passing"
    else
        echo -e "${YELLOW}⚠${NC} Frontend tests not run or failing"
    fi
    cd ..
fi

# Smart contract tests
if [ -f "hardhat.config.js" ]; then
    if npx hardhat test 2>/dev/null | grep -q "passing"; then
        echo -e "${GREEN}✓${NC} Smart contract tests passing"
    else
        echo -e "${YELLOW}⚠${NC} Smart contract tests not run or failing"
    fi
fi

echo ""

# ============================================
# 8. Summary
# ============================================
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}                   SUMMARY${NC}"
echo -e "${BLUE}================================================${NC}"

# Count issues
ISSUES=0
WARNINGS=0

# Analyze output (simplified version)
echo ""
echo -e "Branch: ${BLUE}$CURRENT_BRANCH${NC}"
echo ""

# Provide recommendations
echo -e "${YELLOW}Recommendations:${NC}"

if [ -z "$ALPHAENGINE_CONTRACT_ADDRESS" ]; then
    echo "• Smart Contract team should deploy and share contract address"
    ISSUES=$((ISSUES + 1))
fi

if ! lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "• Backend team should start the server: cd backend && PORT=3001 bun run dev"
    ISSUES=$((ISSUES + 1))
fi

if ! lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "• Frontend team should start the server: cd frontend && PORT=3000 bun run dev"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All systems operational!${NC}"
else
    echo ""
    echo -e "Issues: ${RED}$ISSUES${NC} | Warnings: ${YELLOW}$WARNINGS${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo "Run this script periodically to check integration status"
echo "For detailed logs, check the respective team channels"
echo -e "${BLUE}================================================${NC}"