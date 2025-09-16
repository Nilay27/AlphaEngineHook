# Step 2: Backend Bootstrap Configuration

## Overview
Set up the backend configuration, remove LearnLedger-specific code, and prepare AlphaEngine environment.

## Tasks

### 1. Database Configuration
- Create database configuration file
- Set up connection pooling
- Add database indexes for performance

### 2. Environment Configuration
- Update environment variables for AlphaEngine
- Configure API endpoints
- Set up CORS and security headers

### 3. Clean Up LearnLedger Code
- Remove unused LearnLedger schemas
- Update imports to use AlphaEngine schemas
- Clean up unused API routes

### 4. Bootstrap AlphaEngine Services
- Create base service classes
- Set up error handling
- Configure logging

## Implementation Steps

### Database Configuration
```typescript
// backend/src/config/database.ts
export const dbConfig = {
  database: 'alphaengine',
  tables: {
    strategies: 'strategies',
    subscriptions: 'subscriptions',
    tradeConfirmations: 'trade_confirmations'
  },
  indexes: [
    'idx_strategies_wallet_address',
    'idx_strategies_is_active',
    'idx_subscriptions_strategy_id',
    'idx_subscriptions_subscriber_wallet',
    'idx_trade_confirmations_strategy_id'
  ]
}
```

### API Configuration
- Base URL: `/api/v1`
- Endpoints:
  - `/api/v1/strategies` - Strategy management
  - `/api/v1/subscriptions` - Subscription management
  - `/api/v1/trades` - Trade confirmations
  - `/api/v1/broadcast` - SSE for live updates