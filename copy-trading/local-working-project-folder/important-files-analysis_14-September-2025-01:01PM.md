# Important Files Analysis for LearnLedger to AlphaEngine Migration

## CHANGELOG
- **14-September-2025 01:01 PM IST**: File created with analysis of important files

## Key Files Mentioned in User Prompts

### 1. Visual Design Files (Screenshots)
- **local-working-project-folder/copy-trading-flow.png** - Main flow diagram with annotations showing the transformation concept
- **local-working-project-folder/page-1-select-page.png** - User type selection (Company/Freelancer → Alpha Generator/Consumer)
- **local-working-project-folder/page-2-registeration-page.png** - Registration flow
- **local-working-project-folder/page-3-company-dashboard.png** - Company dashboard to be transformed to Alpha Generator dashboard
- **local-working-project-folder/page-4 to page-15.png** - Various UI pages showing projects, submissions, pull requests flow

### 2. Database Schema Files (Backend)
**To be transformed:**
- `backend/db/schema/projects-schema.ts` → `strategies-schema.ts`
- `backend/db/schema/project-submissions-schema.ts` → `trade-confirmations-schema.ts`
- `backend/db/schema/company-schema.ts` → `alpha-generators-schema.ts`
- `backend/db/schema/freelancer-schema.ts` → `alpha-consumers-schema.ts`
- `backend/db/schema/skills-schema.ts` → Protocol support mapping
- `backend/db/schema/bookmarks-schema.ts`

**To be created:**
- `backend/db/schema/subscriptions-schema.ts` - New subscription management table

### 3. API Route Files (Backend)
**Existing routes to transform:**
- `backend/app/api/projects/route.ts` → `/api/strategies/`
- `backend/app/api/projects/[projectId]/route.ts` → Strategy CRUD operations
- `backend/app/api/projects/[projectId]/submissions/route.ts` → Trade confirmations
- `backend/app/api/submissions/approve/route.ts` → Execute confirmations
- `backend/app/api/register/route.ts` - Remove OCID, add wallet auth
- `backend/app/api/blockchain-utils.ts` - Smart contract integration

**New API routes needed:**
- Subscription management endpoints
- Trade broadcast endpoints
- Strategy execution endpoints

### 4. Frontend Service Files
**To transform:**
- `frontend/src/services/dashboard.service.ts` → `strategy-performance.service.ts`
- `frontend/src/services/dashboard.c.service.ts` → `alpha-generator.service.ts`
- `frontend/src/services/submission.f.service.ts` → `subscription.service.ts`
- `frontend/src/services/submission.c.service.ts` → `trade-confirmation.service.ts`
- `frontend/src/services/register.service.ts` → `wallet-auth.service.ts`

### 5. Frontend Page Components
**Company pages to transform:**
- `frontend/src/pages/company/dashboard/` → Alpha Generator dashboard
- `frontend/src/pages/company/projects/` → Strategy management
- `frontend/src/pages/company/projects/add.tsx` → Import strategy from builder

**Freelancer pages to transform:**
- `frontend/src/pages/freelancer/dashboard/` → Alpha Consumer dashboard
- `frontend/src/pages/freelancer/projects/` → Strategy marketplace
- `frontend/src/pages/freelancer/submissions/` → Trade confirmations

### 6. Database Actions (Backend)
- `backend/actions/db/projects-actions.ts` → `strategies-actions.ts`
- `backend/actions/db/submissions-actions.ts` → `confirmations-actions.ts`
- `backend/actions/db/company-actions.ts` → `alpha-generator-actions.ts`
- `backend/actions/db/freelancer-actions.ts` → `alpha-consumer-actions.ts`

### 7. Configuration Files
- `frontend/src/libs/wagmi-config.ts` - Web3 wallet configuration (already has MetaMask)
- `frontend/.env` - Environment variables for blockchain config
- `backend/.env` - Backend environment variables
- `frontend/src/config/enums.ts` - User type and status enums
- `frontend/src/types/datatype.ts` - TypeScript type definitions

### 8. Context Documents
- `local-working-project-folder/MY-NOTES.md` - Previous conversation history
- `local-working-project-folder/2025-09-14-prompt-conversation-for-writing-chatgpt-project-instructions.txt` - Current conversation

### 9. Package Configuration
- `frontend/package.json` - Next.js 15.1.3, React 18, wagmi, ethers
- `backend/package.json` - Next.js 14.0.4, Drizzle ORM, PostgreSQL

## Priority Files for Migration

### Phase 1: Core Data Model (Database)
1. Database schemas (projects → strategies transformation)
2. New subscriptions table creation
3. Database migration scripts

### Phase 2: Authentication
1. Remove OCID from `backend/app/api/register/`
2. Update wallet authentication in services
3. JWT payload modification

### Phase 3: API Transformation
1. Transform project endpoints to strategy endpoints
2. Add subscription management APIs
3. Implement trade confirmation flow

### Phase 4: Frontend UI
1. Alpha Generator pages (priority - builds infrastructure)
2. Alpha Consumer marketplace and dashboard
3. Trade confirmation interface

### Phase 5: Smart Contract Integration
1. Update `blockchain-utils.ts` with new contract ABIs
2. Add subscription payment verification
3. Event listener implementation

## Critical Dependencies
- **wagmi v2.12.14** - Already installed for Web3 integration
- **ethers.js v6.13.5** - Blockchain interactions
- **Drizzle ORM** - Database management
- **PostgreSQL** - Data storage
- **Next.js** - Full-stack framework (different versions for frontend/backend)