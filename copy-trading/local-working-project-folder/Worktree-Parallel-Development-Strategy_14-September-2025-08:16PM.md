# Git Worktree Parallel Development Strategy

*File created: 14-September-2025-08:16PM*

## CHANGELOG
- **2025-09-14 20:16 IST**: Created worktree strategy document with setup instructions and workflow
- **2025-09-14 20:16 IST**: Added detailed step assignments for each worktree before merge
- **2025-09-14 20:22 IST**: Updated with enhanced parallel development commands and best practices

---

## Setup Complete ✅

### Worktree Structure
```
/Users/consentsam/blockchain/copy-trading/                         [experiments/port-to-copy-trading] - Main repo
/Users/consentsam/blockchain/copy-trading-worktrees/backend-dev     [backend-dev] - Backend development
/Users/consentsam/blockchain/copy-trading-worktrees/frontend-dev    [frontend-dev] - Frontend development
```

## Development Strategy

### **Phase 1: Backend Critical Path (Days 1-3)**
**Worktree**: `backend-dev`
**Focus**: Database foundation and core API endpoints

**Sequential Tasks (Must be done in order):**
1. Step 1: Database schemas (strategies, subscriptions, trade_confirmations)
2. Step 2: Bootstrap indexes and cleanup
3. Step 6: Broadcast endpoint
4. Step 7: SSE event bus
5. Step 8: Consumer pending trades endpoint

**Parallel Tasks (Can be done alongside):**
- Step 3: `/api/strategies` endpoint
- Step 4: Subscribe endpoint
- Step 5: Subscribers endpoint
- Step 9: Debug schema updates
- Step 10: OCID cleanup

### **Phase 2: Frontend Development (Days 4-7)**
**Worktree**: `frontend-dev`
**Focus**: UI components and real-time features

**Service Layer (Parallel Group):**
- Step 11: Strategy service layer
- Step 12: Subscription service
- Step 13: Wallet auth helper

**UI Components (Parallel Group):**
- Step 14: StrategyCard & TradeConfirmationList
- Step 15: SSE client hook

**Pages (Sequential):**
- Step 16: Alpha Generator strategies list
- Step 17: Strategy create page
- Step 18: Consumer confirmations page

**Cleanup (Independent):**
- Step 19: Environment variables
- Step 20: Frontend OCID cleanup

### **Phase 3: Integration (Day 8)**
**Both Worktrees**: Final merge and testing
- Step 21: End-to-end verification

## Worktree Commands

### Switch Between Worktrees
```bash
# Backend development
cd /Users/consentsam/blockchain/copy-trading-worktrees/backend-dev

# Frontend development
cd /Users/consentsam/blockchain/copy-trading-worktrees/frontend-dev

# Main repo (coordination)
cd /Users/consentsam/blockchain/copy-trading
```

### Development Workflow

#### Backend Developer Workflow
```bash
cd /Users/consentsam/blockchain/copy-trading-worktrees/backend-dev

# Start backend server
cd backend
bun dev

# Make changes, commit locally
git add .
git commit -m "Implement database schemas for AlphaEngine"

# Push branch when ready for integration
git push origin backend-dev
```

#### Frontend Developer Workflow
```bash
cd /Users/consentsam/blockchain/copy-trading-worktrees/frontend-dev

# Start frontend server
cd frontend
bun dev

# Make changes, commit locally
git add .
git commit -m "Add StrategyCard component"

# Push branch when ready for integration
git push origin frontend-dev
```

### Integration Workflow

#### Merge Backend Changes
```bash
cd /Users/consentsam/blockchain/copy-trading
git checkout experiments/port-to-copy-trading
git merge backend-dev
git push origin experiments/port-to-copy-trading
```

#### Merge Frontend Changes
```bash
cd /Users/consentsam/blockchain/copy-trading
git checkout experiments/port-to-copy-trading
git merge frontend-dev
git push origin experiments/port-to-copy-trading
```

### Cleanup (When Done)
```bash
# Remove worktrees
git worktree remove ../copy-trading-worktrees/backend-dev
git worktree remove ../copy-trading-worktrees/frontend-dev

# Delete branches (optional)
git branch -D backend-dev frontend-dev
```

## Parallel Development Benefits

### **Time Optimization**
- **Sequential Approach**: 21 days
- **Parallel Approach**: 8 days (62% reduction)

### **Resource Efficiency**
- Backend developer focuses on critical path items
- Frontend developer works on UI while APIs are being built
- Independent tasks (Step 10, Steps 19-20) can be done anytime

### **Risk Mitigation**
- Critical path ensures core functionality is prioritized
- Parallel UI development doesn't block backend progress
- Early integration testing (Step 21) catches issues quickly

## Enhanced Parallel Workflow Commands

### Terminal Session Management (Recommended Setup)
```bash
# Terminal 1: Backend Development
cd /Users/consentsam/blockchain/copy-trading-worktrees/backend-dev
cd backend/
bun install
bun run dev  # Runs on port 3001

# Terminal 2: Frontend Development
cd /Users/consentsam/blockchain/copy-trading-worktrees/frontend-dev
cd frontend/
bun install
bun run dev  # Runs on port 3000

# Terminal 3: Main Repository (Coordination & Merges)
cd /Users/consentsam/blockchain/copy-trading
git status
```

### Synchronization Commands
```bash
# Pull latest changes into worktrees
cd /Users/consentsam/blockchain/copy-trading-worktrees/backend-dev
git fetch origin
git rebase origin/experiments/port-to-copy-trading

cd /Users/consentsam/blockchain/copy-trading-worktrees/frontend-dev
git fetch origin
git rebase origin/experiments/port-to-copy-trading
```

### Submodule Management in Worktrees
```bash
# Update submodules in backend worktree
cd /Users/consentsam/blockchain/copy-trading-worktrees/backend-dev
git submodule update --init --recursive
cd backend/
git pull origin main

# Update submodules in frontend worktree
cd /Users/consentsam/blockchain/copy-trading-worktrees/frontend-dev
git submodule update --init --recursive
cd frontend/
git pull origin main
```

## Best Practices for Parallel Development

### 1. Daily Sync Routine
```bash
# Morning sync (both worktrees)
git fetch --all
git status
git pull --rebase origin experiments/port-to-copy-trading
```

### 2. Commit Strategy
- **Backend**: Commit after each API endpoint completion
- **Frontend**: Commit after each component/service completion
- **Message Format**: "Step X: [Brief description of change]"

### 3. Conflict Prevention
- Define API contracts early (Step 1-2)
- Use mock data in frontend until backend ready
- Communicate breaking changes immediately

### 4. Testing Before Merge
```bash
# Backend testing
cd backend/
bun test
bun run lint

# Frontend testing
cd frontend/
bun test
bun run lint
```

## Next Steps

1. **Assign developers to worktrees**
2. **Start with Step 1 (database schemas) in backend-dev worktree**
3. **Begin parallel work on Steps 3-5 after Step 1 completion**
4. **Switch to frontend-dev worktree once backend APIs are ready**
5. **Regular integration and testing**

---

**Key Success Metrics:**
- ✅ 2 worktrees created successfully
- ⏳ Backend critical path completion (Steps 1-2-6-7-8)
- ⏳ Frontend parallel development (Steps 11-15)
- ⏳ Successful integration and E2E testing (Step 21)