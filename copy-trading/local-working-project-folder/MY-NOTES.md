I am planning to port the current frontend from LearnLedger, a Project Management tool where companies could publish projects and students can submit PR to those projects and then get paid once their PR is accepted. Now, I plan to port this frontend and backend to a frontend and backend which implements copy trading. Please check the flow of the thought process in the following images
![copy-trading-flow](local-working-project-folder/copy-trading-flow.png)

The image at local-working-project-folder/copy-trading-flow.png shows the flow of the thought process in the frontend using the wireframes from the perspective of the alpha-generators and alpha-consumers. Also, I have annotated quite a bit about what we are expecting from the frontend. Though I haven't annotated all the screenshots but I would given some insights on how I am thinking to use this for copy trading.

Please check out the screenshots in local-working-project-folder/page-*.png to check the different pages associated with it. I have annotated few of the screenshots to show the flow of the thought process in the frontend using the wireframes from the perspective of the alpha-generators and alpha-consumers. Please help me come up with some idea on how I can update this for copy trading, keeping the image @copy-trading-flow.png 


Let me provide you the following clarity about all the relevant pages as well
1. local-working-project-folder/page-1-select-page.png
2. local-working-project-folder/page-2-registration-page.png
3. local-working-project-folder/page-3-company-dasdhboard.png
4. local-working-project-folder/page-4-project-page.png
5. local-working-project-folder/page-5-project-page.png
6. local-working-project-folder/page-6-project-page.png
7. local-working-project-folder/page-7-project-page.png
8. local-working-project-folder/page-8-project-page.png
9. local-working-project-folder/page-9-project-page.png
10. local-working-project-folder/page-10-project-page.png
11. local-working-project-folder/page-11-project-page.png
12. local-working-project-folder/page-12-project-page.png
13. local-working-project-folder/page-13-project-page.png
14. local-working-project-folder/page-14-project-page.png
15. local-working-project-folder/page-15-project-page.png



Company => Alpha-Generators => Strategy creators who build and monetize trading strategies
Students => Alpha-Consumers => Traders who subscribe to and execute strategies for ROI
Courses => Trading Strategies => Automated DeFi strategies built using the Builder Platform
Course Modules => Strategy Components => Individual DeFi protocol calls chained together
Certificates => Performance Metrics => Historical ROI and success rate tracking
Learning Progress => Trade Execution History => Record of executed strategies and outcomes

## Technical Context for Alpha Engine Implementation

### Core Platform Features:
1. **Alpha Generators Dashboard** (adapted from Company Dashboard):
   - Create and deploy encrypted trading strategies
   - Monitor subscriber count and revenue
   - View strategy performance metrics
   - Access Builder Platform for strategy creation

2. **Alpha Consumers Interface** (adapted from Student Portal):
   - Browse available strategies with performance history
   - Subscribe to strategies with one-click activation
   - Monitor real-time execution and ROI
   - Access decrypted trade details for subscribed strategies

3. **Builder Platform Specifications**:
   - Visual interface for chaining DeFi protocol calls
   - Support for protocols: Uniswap, Aave, Compound, Curve
   - Single transaction execution for complex strategies
   - Zama FHE encryption applied automatically to all strategies


## Processed Context Engineered Prompts

Context-Engineered Prompt for Copy Trading Platform Migration

  Objective

  Transform the existing LearnLedger project management platform into Alpha Engine,
   a DeFi copy trading platform that enables strategy creators (Alpha Generators)
  to monetize encrypted trading strategies and traders (Alpha Consumers) to
  subscribe and execute these strategies automatically.

  Core Entity Mapping

  User Types

  - Company → Alpha Generator: Strategy creators who build, encrypt, and monetize
  DeFi trading strategies
  - Student/Freelancer → Alpha Consumer: Traders who discover, subscribe to, and
  execute profitable strategies

  Content Entities

  - Projects → Trading Strategies: Encrypted DeFi protocol sequences executable in
  single transactions
  - Pull Requests → Strategy Executions: Automated trade executions with
  performance tracking
  - Skills/Technologies → DeFi Protocols: Supported protocols (Uniswap, Aave,
  Compound, Curve)
  - Rewards/Payments → Revenue Share: Subscription fees and performance-based
  compensation

  UI/UX Transformation Requirements

  Page-by-Page Conversion Specifications

  1. User Selection (page-1):
    - "Post a Job" → "Create Strategy" (Alpha Generators)
    - "Mint Money" → "Copy Trades" (Alpha Consumers)
  2. Dashboard Transformation (page-3):
    - Earnings metrics → Strategy revenue & AUM
    - Pull requests → Active subscriptions
    - Project count → Published strategies
    - Updates feed → Strategy performance alerts
  3. Strategy Builder Interface (replacing project creation):
    - Visual drag-drop protocol chaining
    - Real-time gas estimation
    - Backtesting integration
    - Auto-encryption with Zama FHE
  4. Strategy Marketplace (replacing project listings):
    - Performance metrics (APY, Sharpe ratio, max drawdown)
    - Subscriber count & TVL
    - Risk scoring
    - One-click subscription
  5. Execution Dashboard (replacing submissions):
    - Real-time P&L tracking
    - Transaction history
    - Strategy performance comparison
    - Portfolio analytics

  Technical Architecture Requirements

  Builder Platform Specifications

  - Protocol Integration: Direct smart contract calls to Uniswap V3, Aave V3,
  Compound V3, Curve
  - Strategy Encryption: Zama FHE implementation for strategy obfuscation
  - Execution Engine: Flashloan-enabled single-transaction execution
  - Performance Tracking: On-chain metrics collection and indexing

  Key Features to Implement

  1. Strategy Creation Flow:
    - Protocol selection interface
    - Parameter configuration
    - Condition builders (price triggers, TVL thresholds)
    - Simulation environment
  2. Subscription Management:
    - Smart contract-based subscriptions
    - Automated fee distribution
    - Performance-based tier system
    - Strategy access control
  3. Risk Management:
    - Position size limits
    - Slippage protection
    - Emergency pause mechanisms
    - Strategy audit scores

  Visual References & Annotations

  Analyze the provided wireframes
  (local-working-project-folder/copy-trading-flow.png) showing:
  - User journey bifurcation between Alpha Generators and Consumers
  - Strategy discovery and subscription flow
  - Performance tracking interfaces
  - Revenue distribution mechanisms

  Review UI screenshots (page-*.png) for component reuse opportunities:
  - Navigation structure
  - Card layouts
  - Data visualization components
  - Form patterns

  Deliverables

  1. Component Mapping Document: Detailed mapping of existing components to new
  functionality
  2. Technical Architecture Diagram: System design for strategy encryption,
  execution, and settlement
  3. UI/UX Mockups: High-fidelity designs for core user flows
  4. Implementation Roadmap: Phased approach for migration with priority features
  5. Smart Contract Specifications: Core contracts for subscriptions, execution,
  and revenue sharing

  Success Criteria

  - Seamless strategy creation with <5 minute learning curve
  - Sub-second strategy execution with gas optimization
  - Real-time performance tracking with <100ms latency
  - Secure strategy encryption preventing reverse engineering
  - Automated revenue distribution with transparent fee structure

  Constraints & Considerations

  - Maintain existing authentication and user management systems
  - Preserve current tech stack (specify frontend/backend frameworks)
  - Ensure backward compatibility for data migration
  - Comply with DeFi security best practices
  - Optimize for mobile-responsive design




-------



These are the few clarifications I need to make

"""
- Projects → Trading Strategies: Encrypted DeFi protocol sequences executable in
  single transactions
"""
Initially I was thinking Projects should be the subscriptions but now I am thinking Projects should be the strategies. Why? Let me explain you my rationale
<rationale>
When I was using Projects as subscription service then there was an added flow of buying a subscription to get access to the set of specific strategists. The alpha-generators could make multiple different variations of the specific subscription and then the alpha-consumers could buy those subscription to get access to the set of specific strategists based on whichever subscription that they buy. Once that is done - I was thinking I will have to define and implement the strategist in the current codebase as a different data model in this codebase
BUT
Now, That I am thinking Projects make much more sense if I am thinking of the strategy as the project since it simplifies a lot of implementations for my project. Let me explain how it simplifies, since we are using projects with stratgies, whoever wants to buy this trading strategy will have to buy the project. This is a simple flow and aligns very much to the current flow - enabling me to do minimum changes in the current codebase i.e. backend and frontend and by taking subscription fees as a percentage of the total revenue generated by the strategy. This would be easy for me to implement on the frontend, backend and in the smart contracts side. We will charge the fees from the smart contract while placing that duplicate trade when users/traders copy their trade.


Similarly, I was thinking of the Pull Requests as a copy trade available for the user to confirm if they buy that strategy (or just add in subscription list)  and then it will be executed and I still feel that is the way to go but for reducing the complexity of the current codebase and the associated features,  we can make the trades go automated from the user's profile but I guess making it automated trade might be easy only when I am taking user's ERC20 infinite approval.

""
- Rewards/Payments → Revenue Share: Subscription fees and performance-based
  compensation
""
That simplifies the process as well, we could charge the alpha-consumer to buy or add the project (trade strategies) and then whenever that specific strategy is executed by alpha trader then it would send a trade request to the alpha-consumer and the alpha-consumer would have to confirm the trade request and then the trade would be executed.
</rationale>





--------

## Updated Response i.e. Context Engineered Prompt

Context-Engineered Prompt for Alpha Engine Copy Trading Platform Migration

  Project Context

  Transform the existing LearnLedger project management platform into Alpha Engine, a DeFi
  copy trading platform. The codebase consists of separate Next.js applications for frontend
  and backend, with existing blockchain integration.

  Technical Stack

  Frontend (/frontend)

  - Framework: Next.js 15.1.3, React 18.3.1, TypeScript
  - Web3: wagmi v2.12.14, ethers.js v6.13.5, MetaMask connector
  - Authentication: Wallet-based (replacing OCID with MetaMask)
  - UI: Tailwind CSS, styled-components, Abstract Foundation AGW
  - State: MobX React, React Query
  - Chain: Abstract Testnet (custom chain configuration)

  Backend (/backend)

  - Framework: Next.js 14.0.4 API Routes, TypeScript
  - Database: PostgreSQL with Drizzle ORM
  - Blockchain: ethers.js v6.13.5, custom smart contract integration
  - Authentication: JWT with wallet signatures (remove OCID dependencies)
  - API: RESTful with Swagger documentation

  Core Entity Mapping & Database Schema

  Database Tables to Modify

  1. projects table → strategies table
  // Current: backend/db/schema/projects-schema.ts
  projectId → strategyId
  projectName → strategyName
  projectDescription → strategyDescription
  prizeAmount → subscriptionFee
  requiredSkills → supportedProtocols (Uniswap, Aave, Compound, Curve)
  completionSkills → REMOVE
  projectRepo → strategyContract (on-chain strategy address)
  projectOwnerWalletAddress → alphaGeneratorAddress
  assignedFreelancerWalletAddress → REMOVE
  ADD: performanceMetrics (JSON: APY, Sharpe, maxDrawdown)
  ADD: totalSubscribers
  ADD: totalValueLocked
  ADD: encryptedStrategy (Zama FHE encrypted blob)
  2. project_submissions table → trade_confirmations table
  // Current: backend/db/schema/project-submissions-schema.ts
  submissionId → confirmationId
  projectId → strategyId
  freelancerWalletAddress → alphaConsumerAddress
  prLink → REMOVE
  submissionText → tradeDetails (JSON)
  isMerged → isExecuted
  status → confirmationStatus (pending/approved/rejected)
  ADD: expectedROI
  ADD: gasEstimate
  ADD: executionTimestamp
  3. company table → alpha_generators table
  4. freelancer table → alpha_consumers table

  File Structure & Key Components

  Frontend Pages to Transform

  frontend/src/pages/
  ├── login/ → Connect wallet page
  ├── company/ → alpha-generator/
  │   ├── dashboard/ → Strategy performance dashboard
  │   ├── projects/ → strategies/
  │   │   ├── index.tsx → Strategy marketplace
  │   │   ├── add.tsx → Strategy builder interface
  │   │   └── [id].tsx → Strategy details & metrics
  │   └── pull-requests/ → trade-confirmations/
  └── freelancer/ → alpha-consumer/
      ├── dashboard/ → Portfolio dashboard
      ├── projects/ → subscribed-strategies/
      └── submissions/ → execution-history/

  Backend API Routes to Modify

  backend/app/api/
  ├── projects/ → strategies/
  │   ├── route.ts (GET/POST strategies)
  │   ├── [projectId]/ → [strategyId]/
  │   │   ├── route.ts (GET/PATCH/DELETE strategy)
  │   │   ├── status/ → performance/
  │   │   ├── assign/ → subscribe/
  │   │   └── submissions/ → confirmations/
  ├── submissions/ → executions/
  └── blockchain-utils.ts (Update contract ABI & methods)

  Smart Contract Integration Updates

  // backend/app/api/blockchain-utils.ts
  CONTRACT_ABI updates:
  - registerAsCompanyFor → registerAsAlphaGeneratorFor
  - registerAsFreelancerFor → registerAsAlphaConsumerFor
  - createSubmissionFor → createTradeConfirmationFor
  - approveSubmissionFor → executeStrategyFor
  ADD: subscribeToStrategy, unsubscribeFromStrategy
  ADD: collectFees, distributeRevenue

  Implementation Roadmap

  Phase 1: Authentication Migration

  1. Remove OCID dependencies from backend/app/api/register/route.ts
  2. Update frontend/src/libs/wagmi-config.ts for mainnet support
  3. Implement wallet signature verification in backend
  4. Update JWT payload structure for wallet-based auth

  Phase 2: Database Schema Migration

  1. Create migration scripts in backend/db/migrations/
  2. Update all schema files in backend/db/schema/
  3. Modify Drizzle queries in backend/actions/db/
  4. Update TypeScript types in frontend/src/types/datatype.ts

  Phase 3: API Transformation

  1. Rename and modify all /api/projects endpoints to /api/strategies
  2. Update submission flow to confirmation flow
  3. Add new endpoints for subscription management
  4. Implement performance tracking APIs

  Phase 4: Frontend UI Updates

  1. Transform company dashboard (frontend/src/pages/company/dashboard/)
  2. Build strategy builder interface (modify project creation form)
  3. Create trade confirmation queue UI
  4. Implement portfolio tracking dashboard

  Phase 5: Smart Contract Integration

  1. Deploy new smart contracts for:
    - Strategy subscription management
    - Fee collection and distribution
    - Trade execution with confirmations
  2. Update blockchain-utils.ts with new contract ABIs
  3. Implement on-chain fee deduction during trade copying

  Key Services to Modify

  Frontend Services

  // frontend/src/services/
  dashboard.service.ts → strategy-performance.service.ts
  dashboard.c.service.ts → alpha-generator.service.ts
  submission.f.service.ts → alpha-consumer.service.ts
  submission.c.service.ts → trade-confirmation.service.ts
  register.service.ts → wallet-auth.service.ts

  Backend Actions

  // backend/actions/db/
  projects-actions.ts → strategies-actions.ts
  submissions-actions.ts → confirmations-actions.ts
  company-actions.ts → alpha-generator-actions.ts
  freelancer-actions.ts → alpha-consumer-actions.ts

  Configuration Files to Update

  - frontend/.env: Add strategy encryption keys, DeFi protocol endpoints
  - backend/.env: Update contract addresses, add Zama FHE configuration
  - frontend/src/config/enums.ts: Update user types and status enums
  - frontend/src/Constants/: Add DeFi protocol constants

  Testing Considerations

  - Existing test structure in backend/tests/
  - Update test wallets in backend/tests/generate-wallets.js
  - Modify API tests to reflect new entity names
  - Add integration tests for strategy execution flow

  Migration Strategy

  1. Minimal Refactoring: Leverage existing Project/PR relationship for Strategy/Confirmation
  2. Incremental Updates: Transform one module at a time while maintaining backward
  compatibility
  3. Database Migration: Use Drizzle migrations to rename tables and columns
  4. Smart Contract Bridge: Deploy new contracts that interface with existing infrastructure

  Success Metrics

  - All existing CRUD operations work with new entity names
  - Wallet authentication replaces OCID completely
  - Trade confirmations flow through existing PR infrastructure
  - Smart contract fee collection integrated seamlessly
  - UI reflects copy trading terminology throughout
