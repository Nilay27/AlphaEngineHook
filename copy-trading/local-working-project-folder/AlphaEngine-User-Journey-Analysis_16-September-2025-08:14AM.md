# AlphaEngine User Journey Analysis & Simplification Recommendations

*File created: 16-September-2025-08:14AM*

## CHANGELOG
- **2025-09-16 08:14 IST**: Initial creation with comprehensive user journey analysis and simplification recommendations

---

## Context Analysis Summary

### Current Implementation Status
Based on the implementation plan analysis:
- ✅ **Backend Infrastructure**: Steps 1-20 completed (database schemas, API endpoints, authentication)
- ✅ **Database Schema**: Strategies, subscriptions, trade confirmations tables created
- ✅ **Core APIs**: `/api/strategies`, subscription management, trade confirmation endpoints
- ✅ **Frontend Services**: Strategy, subscription, and wallet auth service layers implemented
- ✅ **UI Components**: StrategyCard, TradeConfirmationList, SSE hooks
- ✅ **Pages**: Alpha Generator and Consumer page structures created
- ⏳ **Integration Testing**: Step 21 (end-to-end verification) pending

### Current User Flow (As Designed)
```
Alpha Generator Flow:
1. Connect MetaMask wallet
2. Create strategy using visual builder
3. Set subscription fee and commission rate
4. Deploy strategy to marketplace
5. Execute trades → broadcast to subscribers
6. Monitor subscriber count and revenue

Alpha Consumer Flow:
1. Connect MetaMask wallet
2. Browse strategy marketplace
3. Pay on-chain subscription fee
4. Receive trade confirmation requests
5. Approve/reject each trade individually
6. View execution history and performance
```

---

## Simplified User Journey Recommendations

### 🎯 **MVP Focus: Alpha Generator First**
Since Alpha Generators build the infrastructure that Alpha Consumers use, we should prioritize their experience.

### **Simplified Alpha Generator Journey**

#### **Core Flow (3 Steps)**
```
1. 📱 CONNECT → MetaMask wallet connection
2. 🔧 CREATE → Simple strategy creation (skip visual builder initially)
3. 📡 EXECUTE → Manual trade execution with subscriber broadcast
```

#### **Detailed Steps**
1. **Wallet Connection** ✅ (Already implemented)
   - Landing page with "Connect as Alpha Generator"
   - MetaMask integration via wagmi
   - Wallet address becomes user identifier

2. **Strategy Creation** (Simplified)
   - **Skip visual builder initially** - too complex for MVP
   - Simple form: Name, Description, Subscription Fee
   - Manual strategy JSON input (for testing)
   - Save to strategies table

3. **Strategy Marketplace**
   - List created strategies
   - Show basic metrics: subscribers, total volume
   - Simple on/off toggle for strategy activation

4. **Trade Execution**
   - Manual trade trigger button
   - Simple form: Token pair, amount, action type
   - Broadcast to all subscribers automatically
   - Show confirmation count in real-time

#### **Dashboard Requirements**
```
Alpha Generator Dashboard:
├── Strategy Overview Cards
│   ├── Total Strategies: 5
│   ├── Active Subscribers: 23
│   └── Total Volume: $12,450
├── Recent Strategies List
│   ├── Strategy name, subscribers, status
│   └── Quick activate/deactivate toggle
└── Quick Actions
    ├── Create New Strategy
    └── Execute Trade
```

### **Simplified Alpha Consumer Journey**

#### **Core Flow (4 Steps)**
```
1. 📱 CONNECT → MetaMask wallet connection
2. 🛒 BROWSE → Strategy marketplace browsing
3. 💰 SUBSCRIBE → One-click subscription payment
4. ✅ CONFIRM → Trade confirmation queue
```

#### **Detailed Steps**
1. **Wallet Connection** ✅ (Already implemented)
   - Landing page with "Connect as Alpha Consumer"
   - Same MetaMask flow as Alpha Generator

2. **Strategy Marketplace**
   - Grid view of available strategies
   - Key info: Name, subscription fee, subscriber count
   - **Simple subscribe button** → triggers MetaMask payment

3. **Subscription Management**
   - One-click subscription via MetaMask
   - Automatic backend verification of payment
   - Add to subscriptions table

4. **Trade Confirmations**
   - Real-time list of pending confirmations
   - Simple Approve/Reject buttons
   - Auto-refresh via SSE (already implemented)

#### **Dashboard Requirements**
```
Alpha Consumer Dashboard:
├── Subscription Overview
│   ├── Active Subscriptions: 3
│   ├── Pending Confirmations: 2
│   └── Total Executed: $3,240
├── Pending Confirmations Queue
│   ├── Strategy name, trade details
│   └── Approve/Reject buttons
└── Subscription List
    ├── Subscribed strategies
    └── Performance metrics
```

---

## MVP Development Optimization Strategy

### **Phase 1: Alpha Generator MVP (Week 1)**
**Goal**: Get Alpha Generators creating and executing basic strategies

#### **Priority Features**
1. **Simple Strategy Creation**
   - Form-based (not visual builder)
   - Fields: name, description, subscription fee
   - Manual JSON input for strategy logic

2. **Basic Dashboard**
   - Strategy list with metrics
   - Create new strategy button
   - Manual trade execution

3. **Trade Broadcasting**
   - Manual trigger for trade execution
   - Auto-broadcast to subscribers ✅ (API exists)
   - Real-time confirmation tracking

#### **Skip for MVP**
- Visual drag-drop builder (too complex)
- Advanced strategy analytics
- Revenue tracking
- Commission calculations (handled in smart contracts)

### **Phase 2: Alpha Consumer MVP (Week 2)**
**Goal**: Enable subscription and trade confirmation flow

#### **Priority Features**
1. **Strategy Marketplace**
   - Browse available strategies
   - Basic filtering by subscription fee
   - One-click subscription

2. **Confirmation Queue** ✅ (Already implemented)
   - Real-time pending confirmations
   - Approve/reject interface
   - Execution tracking

3. **Subscription Management**
   - View active subscriptions
   - Basic performance metrics

#### **Skip for MVP**
- Advanced marketplace filtering
- Strategy performance analytics
- Portfolio tracking
- Unsubscribe functionality (can be manual)

### **Phase 3: Integration & Polish (Week 3)**
1. End-to-end testing ✅ (Step 21 in plan)
2. Error handling improvements
3. UI/UX refinements
4. Performance optimizations

---

## Implementation Priorities

### **Immediate Focus (Next 3-5 Days)**
1. **Alpha Generator Dashboard** - Build the main interface
2. **Simple Strategy Creation** - Form-based approach
3. **Manual Trade Execution** - Trigger trades for testing
4. **Alpha Consumer Marketplace** - Browse and subscribe

### **Backend APIs (Already ✅ Complete)**
- ✅ Strategies CRUD (`/api/strategies`)
- ✅ Subscription management (`/api/strategies/[id]/subscribe`)
- ✅ Trade confirmation broadcasting (`/api/confirmations/broadcast`)
- ✅ Consumer confirmation queue (`/api/consumer/pending-trades`)

### **Frontend Components Needed**
1. **Alpha Generator**:
   - Strategy creation form
   - Dashboard with metrics cards
   - Trade execution interface
   - Strategy list with toggle controls

2. **Alpha Consumer**:
   - Strategy marketplace grid
   - Subscription confirmation flow
   - Trade confirmation queue ✅ (exists)
   - Subscription management panel

---

## Success Metrics for MVP

### **Alpha Generator Success**
- Can create strategy in < 2 minutes
- Can execute trade and see it broadcast
- Dashboard shows real-time subscriber count
- Can see confirmation responses from consumers

### **Alpha Consumer Success**
- Can browse and subscribe to strategy in < 1 minute
- Receives trade confirmations within 5 seconds
- Can approve/reject trades easily
- Payment flow works seamlessly with MetaMask

### **Technical Success**
- ✅ End-to-end flow working without errors
- ✅ Real-time updates via SSE
- ✅ MetaMask integration stable
- ✅ Database operations performing well

---

## Next Steps

1. **Review current frontend page structure** - Check what exists vs what's needed
2. **Identify dashboard components to build** - Focus on Alpha Generator first
3. **Test existing API endpoints** - Verify implementation plan completion
4. **Build missing UI components** - Strategy creation, marketplace, dashboards
5. **Implement manual trade execution** - For MVP testing without visual builder