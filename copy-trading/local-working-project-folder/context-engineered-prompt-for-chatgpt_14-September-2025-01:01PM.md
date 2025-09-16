# Context-Engineered Prompt for AlphaEngine Technical Design Documentation
# AlphaEngine End‑to‑End Journey Audit Prompt

You are a precise coding agent working in Codex CLI with full read/write access to this workspace. Analyze the entire codebase to validate the complete AlphaEngine user journeys and eliminate any LearnLedger coupling in runtime flows. Produce a clear yes/no verdict and concrete evidence.

## Objective
- Confirm AlphaEngine-only navigation and behavior across both roles: AlphaGenerator (Company) and AlphaConsumer (Freelancer).
- Verify end‑to‑end flows for: login → role selection → strategy create/import → strategy listing/marketplace → subscription → trade broadcast → consumer confirmations → execution.
- Detect and flag any LearnLedger references that still influence runtime paths, config, CORS, or environment toggles.

## Personas & Roles
- AlphaGenerator: creates/imports strategies, views metrics, broadcasts trade confirmations.
- AlphaConsumer: discovers strategies, subscribes, receives confirmations, executes trades.

## System Boundaries
- Product is “AlphaEngine”; flows must remain under the AlphaEngine app and API.
- Unacceptable in runtime: learnledger.* domains, LearnLedger branding in UI/telemetry, redirects to LearnLedger, LL‑specific feature flags or envs.
- Acceptable: legacy docs or static files mentioning LearnLedger, provided they do not affect runtime or build configuration.

## Critical Entry Points (verify with file:line evidence)
- selectUserType → AlphaEngine routes
  - frontend/src/pages/login/selectUserType.tsx: Choose “Create Strategies” → `/alpha-generator/strategies`; “Copy Strategies” → `/alpha-consumer/confirmations`.
  - Confirm no LearnLedger redirects, window.location, or external hrefs are used here.
- Core AlphaGenerator pages
  - Listing: frontend/src/pages/alpha-generator/strategies/index.tsx
  - Create/Import: frontend/src/pages/alpha-generator/strategies/create/index.tsx
  - Optional: Subscribers: frontend/src/pages/alpha-generator/subscribers/index.tsx
- Core AlphaConsumer pages
  - Confirmations: frontend/src/pages/alpha-consumer/confirmations/index.tsx
  - Strategies marketplace: frontend/src/pages/alpha-consumer/strategies/index.tsx
- Real-time and API helpers
  - SSE: frontend/src/hooks/useConfirmationsSSE.ts (connects to `/api/confirmations/stream`)
  - API client: frontend/src/utils/api-client.ts and frontend/src/lib/api-client.ts

## End‑to‑End Journeys To Validate

1) Generator Journey: Create/Import and Broadcast
- Login → select “Company” on selectUserType → lands on `/alpha-generator/strategies`.
- Click “Import Strategy” → `/alpha-generator/strategies/create`.
- Submit create form → POST to AlphaEngine API (no LearnLedger endpoints). Expect redirect back to `/alpha-generator/strategies` and new item visible.
- Broadcast trade confirmation → POST `/api/confirmations/broadcast` creates one row per active subscriber and emits SSE.

2) Consumer Journey: Discover, Subscribe, Receive, Execute
- Login → select “Freelancer” → lands on `/alpha-consumer/confirmations`.
- Browse strategies at `/alpha-consumer/strategies` and/or dedicated detail pages; ensure subscribe entry point exists.
- Subscribe flow: pay on‑chain or stubbed, then POST `/api/strategies/[id]/subscribe` (records subscription and increments count).
- Receive SSE events on `/api/confirmations/stream`; pending items appear under `/alpha-consumer/confirmations` and support execution.

## Backend API Contract (AlphaEngine)
- POST `/api/strategies` — create/import strategy.
- GET `/api/strategies` — list strategies.
- POST `/api/strategies/[strategyId]/subscribe` — record subscription (optionally verify tx).
- POST `/api/confirmations/broadcast` — create confirmations for all active subscribers and emit SSE.
- GET `/api/confirmations/stream` — SSE for consumer updates.
- GET `/api/consumer/pending-trades` — list pending confirmations for a consumer (if implemented).

Cross‑check these routes under backend/app/api, db schema under backend/db/schema, and any shared utils in backend/app/api/api-utils and backend/lib.

## Data & State Expectations
- Strategies: fields include `strategyId`, `strategyName`, `subscriptionFee` (wei), `supportedProtocols`, `strategyJSON`, `alphaGeneratorAddress`, `subscriberCount`, `totalVolume`, `isActive`.
- Subscriptions: link `alphaConsumerAddress` to `strategyId` with `subscriptionTxHash`, `isActive`.
- Trade Confirmations: one row per active subscriber per broadcast; includes `executionParams`, `gasEstimate`, `isExecuted`, `executionTxHash`.

## Routing & Navigation Checks
- selectUserType strictly routes to AlphaEngine pages:
  - frontend/src/pages/login/selectUserType.tsx: verify mapping of `company → alpha-generator`, `freelancer → alpha-consumer`, and router.push targets.
- AlphaGenerator listing and create pages use only AlphaEngine API base URL(s) and constants.
- AlphaConsumer confirmations and strategies pages do not link out to LearnLedger.
- Sidebar/navbar components point to AlphaEngine routes only:
  - frontend/src/Components/Layout/Sidebar.tsx
  - frontend/src/Components/Layout/Navbar.tsx

## Environment, Config, and Feature Flags
- Ensure `NEXT_PUBLIC_ALPHAENGINE_API_URL` and any API base URLs resolve to AlphaEngine, not LearnLedger.
- Review CORS and middleware allowlists to avoid LearnLedger cross‑origin coupling in runtime:
  - backend/lib/cors.ts
  - backend/middleware.ts
- OpenAPI or swagger metadata should not drive runtime base URLs for the app; quarantine any LearnLedger values in docs only:
  - backend/lib/openapi.ts
  - backend/static/api-spec.json

## Instrumentation & Telemetry
- Verify OpenTelemetry and loggers don’t include LearnLedger identifiers or domains:
  - frontend/src/lib/telemetry/*
  - backend logging/tracing if present

## Red Flags To Search (repo‑wide)
- Strings: "LearnLedger", "learnledger", "learn-ledger", "LL", "LEARN_LEDGER_URL", legacy API domains.
- Runtime calls: `href`, `window.location`, `fetch`, `axios`, `navigate`, `router.push` pointing to LearnLedger.
- Config toggles that switch flows to LearnLedger, or fallback routes defaulting to LearnLedger.
- CORS allowlists or OpenAPI `BASE` URLs set to LearnLedger that affect runtime.

## Suggested Search Terms/Paths
- Terms: AlphaEngine, selectUserType, Create Strategies, Copy Strategies, strategies, subscribe, confirmations, marketplace, SSE, EventSource, router.push, NEXT_PUBLIC_ALPHAENGINE_API_URL.
- Files: frontend/src/pages/**, frontend/src/Components/**, frontend/src/hooks/**, frontend/src/lib/**, frontend/src/utils/**, backend/app/api/**, backend/lib/**, backend/db/schema/**, middleware, CORS.

## Acceptance Criteria
- No LearnLedger links, redirects, domains, or branding in runtime UI or API requests for these flows.
- “Create Strategies” from selectUserType routes to `/alpha-generator/strategies`; “Copy Strategies” routes to `/alpha-consumer/confirmations`.
- Strategy creation posts to AlphaEngine API and returns to AlphaEngine listing.
- Consumer receives SSE updates on AlphaEngine endpoints and can view pending confirmations.
- All environment/config used at runtime point to AlphaEngine; any LearnLedger values remain only in static docs (if at all).
- Provide file:line evidence for each verified step and route.

## Deliverables
- Verdict: Is the LearnLedger inconsistency fully fixed across both journeys? Yes/No.
- Evidence: Specific file paths with single line references showing the actual routes, API calls, and config used.
- If issues remain: minimal change list with file:line edits and proposed diffs, plus a quick verification checklist.

## Method
1) Map the selectUserType routing and confirm AlphaEngine targets.
2) Trace Generator listing → create/import → API POST → redirect.
3) Trace Consumer marketplace/strategies → subscribe endpoint usage → confirmations SSE → execution path.
4) Inspect API routes, DB schemas, and utils to validate contracts and data flow.
5) Audit env/config, CORS, middleware, and OpenAPI for LearnLedger coupling and determine runtime impact.
6) Report with precise file:line references and a clear verdict; attach proposed patches if needed.

## Known Anchors In This Repo (use as starting evidence)
- frontend/src/pages/login/selectUserType.tsx:151, 160, 162 — role mapping and router.push to AlphaEngine routes.
- frontend/src/pages/alpha-generator/strategies/index.tsx — list page and navigation to create/detail.
- frontend/src/pages/alpha-generator/strategies/create/index.tsx — POST to AlphaEngine `/api/strategies` and redirects.
- frontend/src/pages/alpha-consumer/confirmations/index.tsx — consumer pending confirmations view.
- frontend/src/hooks/useConfirmationsSSE.ts:127 — EventSource to `/api/confirmations/stream`.
- frontend/src/pages/alpha-consumer/strategies/index.tsx:110 — fetch strategies from AlphaEngine API.
- backend/lib/cors.ts, backend/middleware.ts — verify allowlists don’t force LearnLedger origins at runtime.
- backend/lib/openapi.ts — ensure BASE URL does not control runtime client configuration.

## Edge Cases & Gotchas
- Hardcoded links in shared components (Navbar/Sidebar) or 404 fallbacks.
- Feature flags or .env.example defaults that silently route to LearnLedger.
- Client vs server base URL mismatch leading to mixed AlphaEngine/LearnLedger calls.
- SSE connection URL built from the wrong base.

## Out of Scope
- Large refactors unrelated to navigation or subscription/broadcast flows.
- Deleting static LearnLedger documentation (unless it leaks into runtime configs).

---

## Quick Checklist (what to hand back)
- Login and role selection route proof (file:line).
- Generator create/import flow and API endpoints (file:line).
- Consumer subscribe entry point and confirmations SSE wiring (file:line).
- Env/config and CORS sanity (file:line) with LearnLedger removal/quarantine plan.
- Final Yes/No verdict with minimal fix steps if needed.

## Style of the Response
- Be concise, evidence‑driven, and specific.
- Use exact `file:line` references for all claims.
- If proposing fixes, include focused diffs and a short verification script or steps.

## Assumptions
- Wallet gating is handled in the UI; backend endpoints are open as per current MVP.
- “Alpha” equals “strategy” in naming for this audit.

## Success Definition
AlphaGenerator and AlphaConsumer can complete their journeys entirely within AlphaEngine without any LearnLedger involvement, and your report proves it with file:line references or provides the minimum set of changes to make it so.

## CHANGELOG

- **14-September-2025 01:01 PM IST**: File created with comprehensive context-engineered prompt
- **14-September-2025 01:03 PM IST**: Fixed markdown formatting and improved structure
- **14-September-2025 01:07 PM IST**: Final formatting polish and validation
- **14-September-2025 03:34 PM IST**: Updated clarifications for all technical questions, fixed numbering, ensured no API authentication requirement

---

## AlphaEngine Migration: Technical Design Documentation Request

### Project Overview

I need comprehensive Technical Design Documents (TDD) to transform LearnLedger (a project management platform where companies post projects and freelancers submit pull requests) into AlphaEngine (a DeFi copy trading platform where strategy creators monetize trading strategies and traders subscribe to execute them).

## Current Architecture Context

### Technology Stack

**Frontend:** Next.js 15.1.3, React 18.3.1, TypeScript, wagmi v2.12.14, ethers.js v6.13.5, Tailwind CSS
**Backend:** Next.js 14.0.4 (API Routes), PostgreSQL, Drizzle ORM, ethers.js
**Authentication:** Currently OCID(if it's not already removed) , migrating to MetaMask wallet signatures
**Blockchain:** Abstract Testnet configuration, Web3 integration ready

### Codebase Structure

```text
learnledger/
├── frontend/                 # Next.js 15.1.3 app
│   ├── src/pages/           # Page components
│   ├── src/services/        # API services
│   ├── src/Components/      # Reusable components
│   └── src/libs/           # Config (wagmi setup exists)
├── backend/                 # Next.js 14.0.4 API
│   ├── app/api/            # API routes
│   ├── db/schema/          # Drizzle ORM schemas
│   └── actions/db/         # Database operations
└── local-working-project-folder/  # Documentation & mockups
```

## Core Transformation Mappings

### Entity Relationships

```text
LearnLedger → AlphaEngine
─────────────────────────
Company → Alpha Generator (strategy creators)
Freelancer → Alpha Consumer (copy traders)
Project → Trading Strategy (DeFi protocol sequences from external builder)
Pull Request → Trade Confirmation (execution approval request)
Project Submission → Trade Execution Record
Skills → Supported Protocols (Uniswap, Aave, Compound, Curve)
Prize Amount → Subscription Fee (one-time on-chain payment)
```

### Business Logic Transformation

**Current Flow (LearnLedger):**

1. Company creates project with requirements
2. Freelancer submits PR with solution
3. Company reviews and approves PR
4. Payment released to freelancer

**Target Flow (AlphaEngine):**

1. Alpha Generator imports strategy JSON (which contains DeFi protocol function call sequences) from external builder service
2. Alpha Consumer pays on-chain subscription fee to access strategy
3. Alpha Generator executes trades based on strategy
4. Subscribed consumers receive trade confirmation requests
5. Consumers approve/reject execution
6. Approved trades execute on-chain

## Critical Technical Decisions Made

### 1. Strategy Storage Model

- Strategies stored as JSON from external builder service (not created internally)
- Field: `strategyJSON` contains DeFi protocol function call sequences
- No visual builder component needed in this codebase

### 2. Subscription Model

- One-time on-chain payment for strategy access
- No commission system (handled by smart contracts)
- Subscription verification before showing trade confirmations

### 3. Authentication Migration

- Remove all OCID dependencies
- Use MetaMask wallet for authentication

### 4. Implementation Priority

- Alpha Generator features first (establishes infrastructure)
- Reuse existing Project/PR relationship for Strategy/Confirmation
- Minimal backend refactoring approach

## Required Technical Design Documents

### 1. Database Migration Design

**I need detailed documentation for:**

- Complete Drizzle ORM migration scripts with exact syntax
- Table renaming strategy preserving foreign keys
- New `subscriptions` table schema with indexes
- Data type transformations (especially for blockchain data)
- Rollback procedures for each migration step

**Key transformations:**

- `projects` → `strategies` (with new fields: subscriberCount, totalVolume, isActive)
- `project_submissions` → `trade_confirmations` (with gasEstimate, executionTxHash)
- New `subscriptions` table linking consumers to strategies

### 2. API Contract Specifications

**Document each endpoint with:**

- Request/Response TypeScript interfaces
- **No authentication required** (API routes are open, authentication handled at wallet level)
- Error handling patterns

**Priority endpoints:**

- `POST /api/strategies/create` - Import strategy from builder
- `POST /api/strategies/[id]/subscribe` - On-chain payment verification
- `POST /api/confirmations/broadcast` - Send to all subscribers
- `GET /api/consumer/pending-trades` - Filtered by subscriptions

### 3. State Management Architecture

**Define state flows for:**

- Subscription verification process
- Trade confirmation queue management
- Real-time updates via WebSocket/polling
- Wallet connection state handling
- Transaction status tracking

### 4. Component Hierarchy Mapping

**Provide detailed mapping of:**

- Which existing components can be reused with minimal changes
- New components needed for copy trading features
- Props interface changes for transformed components
- Routing structure changes

**Example mappings needed:**

- `ProjectCard` → `StrategyCard` (what props change?)
- `PRList` → `TradeConfirmationQueue` (data structure changes?)
- `CompanyDashboard` → `AlphaGeneratorDashboard` (metric calculations?)

### 5. Smart Contract Integration Specs

**Document integration points:**

```javascript
// Required contract functions
subscribeToStrategy(bytes32 strategyId) payable
isSubscribed(address user, bytes32 strategyId) returns (bool)
broadcastTradeConfirmation(bytes32 strategyId, bytes params)
executeConfirmedTrade(bytes32 confirmationId)

// Event listeners needed
event SubscriptionPaid(address user, bytes32 strategyId, uint256 amount)
event TradeExecuted(bytes32 confirmationId, address consumer)
```

### 6. Authentication Migration Plan

**Step-by-step guide for:**

- Removing OCID dependencies (search patterns to find all instances)
- Implementing wallet signature verification (client-side only)
- **No Authentication required on API routes** (all API endpoints are open)
- Session management updates (wallet-based sessions)
- Middleware modifications (remove auth middleware)

### 7. Testing Strategy

**Define test cases for:**

- Subscription payment verification
- Trade confirmation flow
- Strategy import from builder service
- Wallet authentication
- Database migration validation

## Specific Technical Questions to Address

1. **Strategy JSON Structure:** Define exact schema for strategy JSON from builder service
   > **Clarification:** For now - assume anything that is required to be in the strategy JSON, I will update it later

2. **Subscription Verification:** How to efficiently check subscription status for each request?
   > **Clarification:** For now - We could query a smart contract to check if the user is subscribed to the strategy

3. **Trade Broadcast:** Optimal method for notifying all subscribers (push vs pull)?
   > **Clarification:** We would use push notifications to notify all subscribers - minimal implementation of code to make it work. No complicated push notification system

4. **Event Listening:** WebSocket vs polling for blockchain events?
   > **Clarification:** We would use polling for blockchain events to get the trade corresponding to the strategies that the user has subscribed to. If the alpha-generator has executed any trade corresponding to the strategy that the user has subscribed to, then the user should be notified i.e. a trade confirmation request should be sent to the user/trader.

5. **Caching Strategy:** What data to cache and invalidation triggers?
   > **Clarification:** Don't worry about the caching since we are building an MVP

## File-Specific Transformation Guide Needed

### Database Schemas (backend/db/schema/)

- `projects-schema.ts` → `strategies-schema.ts`: Field-by-field mapping
- `project-submissions-schema.ts` → `trade-confirmations-schema.ts`: Relation changes
- New `subscriptions-schema.ts`: Complete schema definition

### API Routes (backend/app/api/)

- List all routes that need renaming
- New route implementations required
- Routes that can be deleted

### Frontend Services (frontend/src/services/)

- Service method transformations
- New methods needed
- API endpoint updates

## Expected Deliverables Format

For each design document, provide:

1. **Current State Analysis** - How it works in LearnLedger
2. **Target State Design** - How it should work in AlphaEngine
3. **Migration Steps** - Ordered list of changes
4. **Code Examples** - TypeScript/JavaScript snippets
5. **Testing Checklist** - Validation steps
6. **Rollback Plan** - How to revert if needed

## Constraints & Requirements

- **Preserve:** Next.js structure, PostgreSQL, Drizzle ORM
- **Remove:** All OCID references, GitHub webhooks, completion skills
- **Add:** Wallet auth, subscription management, trade confirmations
- **External:** Strategy JSON comes from builder service (not created internally)
- **Priority:** Alpha Generator features enable Alpha Consumer features

## Success Criteria

The TDD should enable a developer to:

1. Execute database migrations - do not worry about data loss
2. Transform all API endpoints systematically
3. Update frontend components with clear prop mappings
4. Integrate smart contracts for subscriptions
5. Implement wallet authentication replacing OCID
6. Maintain existing architecture patterns

Please help me create these Technical Design Documents with architectural decisions, implementation details, and clear migration paths for each module. Focus on Alpha Generator flows first as they establish the core infrastructure needed for Alpha Consumers.
