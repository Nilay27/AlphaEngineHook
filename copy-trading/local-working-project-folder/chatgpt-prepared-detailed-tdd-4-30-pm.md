# AlphaEngine Migration — Technical Design Documents (Aligned to Your Repo)

Below I reference only files and dirs that exist in your repo and clearly mark anything that’s **new**. The plan prioritizes **Alpha Generator** features and keeps **API routes open** (wallet auth handled client-side with MetaMask/wagmi).

---

## 0) Repo Reality Check (what’s in your code today)

- **Backend (Next.js 14)**  
  - Schemas: `backend/db/schema/projects-schema.ts`, `project-submissions-schema.ts`, `index.ts`, `db.ts`  
  - Actions: `backend/actions/db/projects-actions.ts`, `submissions-actions.ts`  
  - API routes (partial):  
    - `backend/app/api/projects/route.ts`  
    - `backend/app/api/projects/[projectId]/...` (status, assign, submissions, submissions/[submissionId])  
    - `backend/app/api/projects/approve/route.ts`, `search/`, `stats/`  
    - `backend/app/api/register/route.ts` (to be removed)  
    - Utilities: `backend/app/api/api-utils.ts`, `backend/app/api/blockchain-utils.ts`  
    - Debug: `backend/app/api/debug/schema/route.ts`  
  - Middleware: `backend/middleware.ts`  
  - OCID remnants (mock): `backend/components/utilities/ocid-provider.tsx` (+ imported by `components/utilities/nav-bar.tsx`)
  - Wallet mock: `backend/components/utilities/wallet-provider.tsx`  

- **Frontend (Next.js 15)**  
  - Services: `frontend/src/services/dashboard.service.ts`, `register.service.ts`, `submission.f.service.ts`, `submission.c.service.ts`  
  - Wagmi config: `frontend/src/libs/wagmi-config.ts`, `src/libs/chains.ts` (Abstract Testnet is correctly defined)  
  - Pages: `frontend/src/pages/company/...`, `frontend/src/pages/freelancer/...`, `frontend/src/pages/login/...`

- **Docs & assets:** `local-working-project-folder/` contains flow images and notes (kept as context).

---

# 1) Database Migration Design (Drizzle ORM, PostgreSQL)

### 1.1 Approach
You said we **don’t need to preserve old tables**. We’ll do a clean AlphaEngine schema and retire LearnLedger tables. (I still include an optional *rename path* if you prefer continuity.)

### 1.2 New Schema Files (create under `backend/db/schema/`)

#### `strategies-schema.ts` **(NEW)**
```ts
// backend/db/schema/strategies-schema.ts
// @ts-nocheck
import { pgTable, text, varchar, boolean, timestamp, jsonb, numeric, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const strategiesTable = pgTable("strategies", {
  strategyId: text("strategy_id").primaryKey().default(sql`gen_random_uuid()`),
  strategyName: varchar("strategy_name", { length: 255 }),
  strategyDescription: text("strategy_description"),
  subscriptionFee: varchar("subscription_fee"), // store as string of wei if needed
  supportedProtocols: jsonb("supported_protocols"), // string[] | richer metadata
  strategyJSON: jsonb("strategy_json"), // external builder payload (see §2.6 Strategy JSON schema)
  alphaGeneratorAddress: text("alpha_generator_address"),
  subscriberCount: integer("subscriber_count").default(0).notNull(),
  totalVolume: numeric("total_volume", { precision: 78, scale: 0 }).default("0"), // wei total
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export type Strategy = typeof strategiesTable.$inferSelect;
export type NewStrategy = typeof strategiesTable.$inferInsert;
```

#### `subscriptions-schema.ts` **(NEW)**
```ts
// backend/db/schema/subscriptions-schema.ts
// @ts-nocheck
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const subscriptionsTable = pgTable("subscriptions", {
  subscriptionId: text("subscription_id").primaryKey().default(sql`gen_random_uuid()`),
  strategyId: text("strategy_id").notNull(),
  alphaConsumerAddress: text("alpha_consumer_address").notNull(),
  subscriptionTxHash: text("subscription_tx_hash").notNull(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).default(sql`now()`).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
```

#### `trade-confirmations-schema.ts` **(NEW)**
```ts
// backend/db/schema/trade-confirmations-schema.ts
// @ts-nocheck
import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tradeConfirmationsTable = pgTable("trade_confirmations", {
  confirmationId: text("confirmation_id").primaryKey().default(sql`gen_random_uuid()`),
  strategyId: text("strategy_id").notNull(),
  alphaConsumerAddress: text("alpha_consumer_address").notNull(),
  executionParams: jsonb("execution_params"), // exact payload for this trade
  gasEstimate: text("gas_estimate"), // string
  isExecuted: boolean("is_executed").default(false).notNull(),
  executionTxHash: text("execution_tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export type TradeConfirmation = typeof tradeConfirmationsTable.$inferSelect;
export type NewTradeConfirmation = typeof tradeConfirmationsTable.$inferInsert;
```

#### Export new tables
```ts
// backend/db/schema/index.ts (append)
export * from './strategies-schema'
export * from './trade-confirmations-schema'
export * from './subscriptions-schema'
```

### 1.3 Indexes (migration SQL you can run once)
Create a bootstrap script or run via `db.execute(sql`...`)` from a temporary route.

```sql
-- strategies
CREATE INDEX IF NOT EXISTS idx_strategies_generator ON strategies (alpha_generator_address);
CREATE INDEX IF NOT EXISTS idx_strategies_active ON strategies (is_active);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_strategy ON subscriptions (strategy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_consumer ON subscriptions (alpha_consumer_address);
CREATE UNIQUE INDEX IF NOT EXISTS ux_one_sub_per_strategy
  ON subscriptions (strategy_id, alpha_consumer_address) WHERE is_active = true;

-- trade_confirmations
CREATE INDEX IF NOT EXISTS idx_conf_consumer_executed
  ON trade_confirmations (alpha_consumer_address, is_executed);
CREATE INDEX IF NOT EXISTS idx_conf_strategy ON trade_confirmations (strategy_id);
```

### 1.4 Optional: “Rename path” if you prefer transforms (not required)
- `projects` → `strategies`: rename columns & drop unused.  
- `project_submissions` → `trade_confirmations`.  
- Add new `subscriptions`.  
Because you allow a fresh DB, I recommend **dropping** LL tables instead of renames to avoid historical constraints.

### 1.5 Drop LL tables (if you want a clean DB)
```sql
DROP TABLE IF EXISTS project_submissions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
-- (and other LL tables you no longer need)
```

### 1.6 Data Types for Blockchain
- Addresses & hashes → `text`.  
- Amounts (ETH/wei) → **store as string** or `numeric(78,0)`; display conversion on the client.  
- `strategyJSON` & `executionParams` → `jsonb` for flexibility.

### 1.7 Rollback Procedures
- **Rollback** to LL: recreate `projects` and `project_submissions` from current repo schema files:  
  - `backend/db/schema/projects-schema.ts`  
  - `backend/db/schema/project-submissions-schema.ts`  
  - Re-expose old API routes in `app/api/projects/...` (they already exist).  
- **Rollback from clean AlphaEngine**:  
  - `DROP TABLE trade_confirmations, subscriptions, strategies;`  
  - Restore old tables via LL schema / migrations above.

---

# 2) API Contract Specifications (open endpoints; wallet-gated in UI)

> Implementation files live under `backend/app/api`. I give **file paths**, **TypeScript interfaces**, and **reference code** that fits your project style (`api-utils.ts`, `db/db`, Drizzle).

## 2.1 POST `/api/strategies/create`  — **NEW**
**File:** `backend/app/api/strategies/route.ts` (handles both GET list & POST create; mirrors your `/api/projects/route.ts`)

**Request (Alpha Generator)**
```ts
export interface CreateStrategyRequest {
  strategyName: string;
  strategyDescription?: string;
  subscriptionFee: string;  // wei or as string
  supportedProtocols: string[]; // ["Uniswap","Aave",...]
  strategyJSON: any; // see §2.6 schema
  alphaGeneratorAddress: string;
}
```

**Response**
```ts
export interface StrategyDTO {
  strategyId: string;
  strategyName: string;
  strategyDescription?: string;
  subscriptionFee: string;
  supportedProtocols: string[];
  strategyJSON: any;
  alphaGeneratorAddress: string;
  subscriberCount: number;
  totalVolume: string; // wei
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Implementation (excerpt)**
```ts
// backend/app/api/strategies/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { desc, eq } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export async function GET(req: NextRequest) {
  try {
    const data = await db.select().from(strategiesTable).orderBy(desc(strategiesTable.createdAt));
    return successResponse(data, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // (Optionally) validate required fields
    const [row] = await db.insert(strategiesTable).values({
      strategyName: body.strategyName,
      strategyDescription: body.strategyDescription,
      subscriptionFee: body.subscriptionFee,
      supportedProtocols: body.supportedProtocols,
      strategyJSON: body.strategyJSON,
      alphaGeneratorAddress: body.alphaGeneratorAddress,
    }).returning()
    return successResponse(row, 'Created', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}
```

## 2.2 POST `/api/strategies/[strategyId]/subscribe` — **NEW**
**File:** `backend/app/api/strategies/[strategyId]/subscribe/route.ts`

**Request**
```ts
export interface SubscribeRequest {
  alphaConsumerAddress: string;
  subscriptionTxHash: string; // paid tx hash
}
```

**Response**
```ts
export interface SubscribeResponse {
  isSuccess: boolean;
  message?: string;
  data?: {
    subscriptionId: string;
    strategyId: string;
    alphaConsumerAddress: string;
    subscriptionTxHash: string;
    isActive: boolean;
  }
}
```

**Implementation (excerpt)**
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { eq, and, sql } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'
import { ethers } from 'ethers'

export async function POST(req: NextRequest, { params }: { params: { strategyId: string }}) {
  try {
    const strategyId = params.strategyId
    const { alphaConsumerAddress, subscriptionTxHash } = await req.json()

    // Minimal on-chain verification: check tx exists & succeeded
    if (process.env.BLOCKCHAIN_RPC_URL) {
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL)
      const receipt = await provider.getTransactionReceipt(subscriptionTxHash)
      if (!receipt || receipt.status !== 1) {
        return errorResponse('Subscription tx not found or failed', 400, req)
      }
    }

    const [existing] = await db.select().from(subscriptionsTable).where(
      and(eq(subscriptionsTable.strategyId, strategyId), eq(subscriptionsTable.alphaConsumerAddress, alphaConsumerAddress))
    ).limit(1)

    if (existing?.isActive) {
      return successResponse(existing, 'Already subscribed', 200, req)
    }

    // Create/activate subscription
    const [row] = await db.insert(subscriptionsTable).values({
      strategyId,
      alphaConsumerAddress,
      subscriptionTxHash,
      isActive: true
    }).returning()

    // Increment counter
    await db.execute(sql`UPDATE strategies SET subscriber_count = subscriber_count + 1 WHERE strategy_id = ${strategyId}`)

    return successResponse(row, 'Subscribed', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}
```

## 2.3 GET `/api/strategies/[strategyId]/subscribers` — **NEW**
**File:** `backend/app/api/strategies/[strategyId]/subscribers/route.ts`

**Response**: list of `{ alphaConsumerAddress, subscribedAt, isActive }`.

## 2.4 POST `/api/confirmations/broadcast` — **NEW**
**File:** `backend/app/api/confirmations/broadcast/route.ts`  
**Behavior:** Alpha Generator posts a `strategyId + executionParams`; server creates a `trade_confirmations` row **for each active subscriber** and (optionally) pushes SSE events.

**Request**
```ts
export interface BroadcastRequest {
  strategyId: string;
  executionParams: any; // free-form payload; mirrors strategyJSON step
  gasEstimate?: string;
}
```

**Response**
```ts
export interface BroadcastResponse {
  created: number; // number of confirmations created
}
```

**Implementation (excerpt)**
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { eq } from 'drizzle-orm'
import { successResponse, serverErrorResponse } from '@/app/api/api-utils'
import { emitConfirmationEvent } from '@/app/api/confirmations/stream/bus' // see SSE below

export async function POST(req: NextRequest) {
  try {
    const { strategyId, executionParams, gasEstimate } = await req.json()

    const subs = await db.select().from(subscriptionsTable)
      .where(eq(subscriptionsTable.strategyId, strategyId))

    if (!subs.length) return successResponse({ created: 0 }, 'No subscribers', 200, req)

    const rows = await Promise.all(subs.map(s =>
      db.insert(tradeConfirmationsTable).values({
        strategyId,
        alphaConsumerAddress: s.alphaConsumerAddress,
        executionParams,
        gasEstimate
      }).returning()
    ))
    // Flat + emit SSE for each
    const created = rows.flat().length
    rows.flat().forEach(r => emitConfirmationEvent(r))
    return successResponse({ created }, 'Broadcasted', 201, req)
  } catch (e:any) {
    return serverErrorResponse(e, req)
  }
}
```

## 2.5 GET `/api/consumer/pending-trades` — **NEW**
**File:** `backend/app/api/consumer/pending-trades/route.ts`

**Query params:** `alphaConsumerAddress`  
**Response:** list of `TradeConfirmation` where `isExecuted=false`.

## 2.6 (Optional) POST `/api/strategies/[strategyId]/execute` — **NEW**
Marks a confirmation executed (after on-chain tx). Stores `executionTxHash`, sets `isExecuted=true`, updates strategy `totalVolume` if applicable.

---

## 2.6 Strategy JSON — baseline schema (you can evolve later)

We’ll accept a flexible JSON that your **external builder** produces. Minimal schema:

```json
{
  "version": "1.0",
  "chainId": 11155111,
  "name": "Mean Reversion V1",
  "steps": [
    {
      "protocol": "UniswapV3",
      "action": "swapExactInput",
      "params": {
        "tokenIn": "0x...",
        "tokenOut": "0x...",
        "fee": 3000,
        "amountInWei": "100000000000000000",
        "slippageBps": 50
      }
    },
    {
      "protocol": "AaveV3",
      "action": "supply",
      "params": { "token": "0x...", "amountWei": "100000000000000000" }
    }
  ],
  "risk": { "maxSlippageBps": 75, "stopLossBps": 300 },
  "metadata": { "author": "0xAlpha...", "tags": ["uniswap","aave"] }
}
```

Store this as-is in `strategies.strategyJSON`. Individual `executionParams` sent in `/broadcast` can be a snapshot (full or partial) of the relevant step with runtime args.

---

# 3) State Management Architecture (Frontend)

- **Wallet connection:** `wagmi` (`frontend/src/libs/wagmi-config.ts` already correct). Use `useAccount()`, `useSignMessage()`.  
- **Subscriptions:**  
  1) UI calls `subscribeToStrategy` (contract) → wait tx → call `POST /api/strategies/[id]/subscribe` with `txHash`.  
  2) For gating UI, **frontend** checks `isSubscribed` (contract) and/or `/api/strategies/[id]/subscribers` (fast path).

- **Trade confirmation queue:**  
  - Consumer dashboard polls `GET /api/consumer/pending-trades?alphaConsumerAddress=0x...` **and** keeps an **SSE** connection for pushes:
    - **SSE:** `GET /api/confirmations/stream` (see below).  
    - Fallback to polling every 15–30s if SSE not available.

- **WebSocket/SSE choice:** We implement **SSE** (no extra infra).  
  - **NEW** files:  
    - `backend/app/api/confirmations/stream/bus.ts` (EventEmitter singleton)  
    - `backend/app/api/confirmations/stream/route.ts` (SSE endpoint)

**SSE bus**
```ts
// backend/app/api/confirmations/stream/bus.ts
import { EventEmitter } from 'node:events'
const bus = new EventEmitter()
export const emitConfirmationEvent = (payload:any) => bus.emit('confirmation', payload)
export const subscribe = (fn:(p:any)=>void) => { bus.on('confirmation', fn); return () => bus.off('confirmation', fn) }
```

**SSE route**
```ts
// backend/app/api/confirmations/stream/route.ts
import { NextRequest } from 'next/server'
import { subscribe } from './bus'

export const runtime = 'nodejs' // keep long-lived response

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data:any) => controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
      const unsub = subscribe(send)
      // send a heartbeat
      const heart = setInterval(() => controller.enqueue(new TextEncoder().encode(`: ping\n\n`)), 15000)
      return () => { clearInterval(heart); unsub() }
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

- **Tx status tracking:**  
  - In UI, show `pending / confirmed` via `useWaitForTransactionReceipt` (wagmi v2).  
  - For on-chain executions, store `executionTxHash` via `POST /api/strategies/[id]/execute` (optional).

**ASCII flow (Consumer dashboard)**

```
SSE connect ──────────────┐
                          │ (push)
          Poll pending ───┼── trade_confirmations (isExecuted=false)
                          │ (push)
     Approve/Execute ─────┘ → wallet tx → mark executed (API)
```

---

# 4) Component & Routing Mapping (Frontend)

> Your current pages use **company/freelancer** naming. We’ll keep those directories but introduce **Alpha Engine** routes. You can migrate incrementally.

### 4.1 New pages (minimal, can re-use layouts)
- `/alpha-generator/dashboard/` **(NEW)**  
- `/alpha-generator/strategies/` **(NEW)**  
- `/alpha-generator/strategies/create/` **(NEW)**  
- `/alpha-generator/strategies/[id]/` **(NEW)**  
- `/alpha-generator/execute/` **(NEW)**  
- `/alpha-consumer/marketplace/` **(NEW)**  
- `/alpha-consumer/marketplace/[id]/` **(NEW)**  
- `/alpha-consumer/dashboard/` **(NEW)**  
- `/alpha-consumer/confirmations/` **(NEW)**  
- `/alpha-consumer/history/` **(NEW)**

### 4.2 Reusable UI components to add
- `frontend/src/Components/StrategyCard.tsx` **(NEW)**
```ts
export interface StrategyCardProps {
  strategyId: string;
  strategyName: string;
  subscriptionFee: string;
  supportedProtocols: string[];
  subscriberCount: number;
  totalVolumeWei: string;
  isActive: boolean;
  onSubscribe?: () => void;
}
```
- `frontend/src/Components/TradeConfirmationList.tsx` **(NEW)**
```ts
export interface TradeConfirmationItem {
  confirmationId: string;
  strategyId: string;
  executionParams: any;
  gasEstimate?: string;
}
```

### 4.3 Concrete mappings

| LearnLedger (existing) | AlphaEngine (target) | What changes |
|---|---|---|
| `company/projects/index.tsx` listing | `/alpha-generator/strategies/` | Replace service: `dashboard.service.ts` → **`strategy-performance.service.ts`** (NEW) for metrics; list from `GET /api/strategies` |
| `company/projects/new.tsx` | `/alpha-generator/strategies/create/` | Replace form fields: no `completionSkills`; add `supportedProtocols[]`, `subscriptionFee`, `strategyJSON` textarea/upload |
| `company/pull-requests/...` | `/alpha-generator/execute/` | Replace PR list with “Pending Confirmations” & “Broadcast Trade” UI |
| `freelancer/projects/index.tsx` | `/alpha-consumer/marketplace/` | Card becomes **StrategyCard**; subscribe CTA |
| `freelancer/submissions/index.tsx` | `/alpha-consumer/confirmations/` | List `trade_confirmations` where `isExecuted=false` |
| `dashboard.service.ts` | **`strategy-performance.service.ts` (NEW)** | Metrics: total subscribers, 30d volume, active strategies |
| `submission.f.service.ts` | **`subscription.service.ts` (NEW)** | Methods: `subscribe()`, `isSubscribed()`, `getSubscribers()` |
| `register.service.ts` | **`wallet-auth.service.ts` (NEW)** | Replace OCID; provide typed message-sign flow if needed |

---

# 5) Smart Contract Integration Specs

Contract functions to use (as you defined):
```
subscribeToStrategy(bytes32 strategyId) payable
isSubscribed(address user, bytes32 strategyId) returns (bool)
getSubscriptionFee(bytes32 strategyId) returns (uint256)
getStrategySubscribers(bytes32 strategyId) returns (address[])

broadcastTradeConfirmation(bytes32 strategyId, bytes params)
executeConfirmedTrade(bytes32 confirmationId)

events:
SubscriptionPaid(address user, bytes32 strategyId, uint256 amount)
TradeExecuted(bytes32 confirmationId, address consumer)
```

### 5.1 Frontend helpers (wagmi + viem or ethers v6)
- Read functions (fast): viem/wagmi read hooks.  
- Write: wagmi write.  
- After successful `subscribeToStrategy` tx, call **`POST /api/strategies/[id]/subscribe`** with `txHash`.

### 5.2 Backend minimal verification
- We already validate `subscriptionTxHash` receipt (optional, can be skipped for dev networks).  
- **No backend auth** checks beyond basic input validation.

### 5.3 Event listening (polling, per your decision)
- **Consumer app**: Polling endpoint (optional) `GET /api/events/poll?strategyId=&fromBlock=&toBlock=` can be added later.  
- MVP: rely on SSE from `broadcast` + local contract polling in UI as needed.

---

# 6) Authentication Migration Plan (Remove OCID)

### Files to remove/neutralize
- `backend/app/api/register/route.ts` — **delete** route.  
- `backend/components/utilities/ocid-provider.tsx` — **delete** file and imports.  
- `backend/components/utilities/nav-bar.tsx` — remove `useOpenCampusAuth` import; optionally replace with a lightweight wallet indicator or remove nav login entirely on backend app.  
- Any mention of **OpenCampus/OCID** in `backend/app/opencampus/redirect/page.tsx` (delete the page if not needed).

### Wallet auth (client-only, no server sessions)
- Use `wagmi` in **frontend**.  
- If you need signed actions (e.g., “Confirm trade off-chain”), add `lib/ethereum/signature-utils.ts` **in frontend** (you already have a server-side version in `backend/lib/ethereum/signature-utils.ts` tailored for LL; you can mirror/adapt it for AlphaEngine names).  
- Keep **API endpoints open**; the UI gates sensitive actions by requiring a connected wallet and, where necessary, signature preflights.

---

# 7) Testing Strategy

### 7.1 Backend API smoke tests (cURL)

- **Create strategy**
```bash
curl -X POST http://localhost:3000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{"strategyName":"Test","subscriptionFee":"1000000000000000","supportedProtocols":["Uniswap"],"strategyJSON":{"version":"1.0","steps":[]},"alphaGeneratorAddress":"0xabc..."}'
```

- **Subscribe (after on-chain tx)**
```bash
curl -X POST http://localhost:3000/api/strategies/<strategyId>/subscribe \
  -H "Content-Type: application/json" \
  -d '{"alphaConsumerAddress":"0xdef...","subscriptionTxHash":"0x..."}'
```

- **Broadcast trade**
```bash
curl -X POST http://localhost:3000/api/confirmations/broadcast \
  -H "Content-Type: application/json" \
  -d '{"strategyId":"<id>","executionParams":{"protocol":"UniswapV3","action":"swapExactInput","params":{"...":"..."}}, "gasEstimate":"210000"}'
```

- **Get pending trades**
```bash
curl "http://localhost:3000/api/consumer/pending-trades?alphaConsumerAddress=0xdef..."
```

- **SSE test**
```bash
curl -N http://localhost:3000/api/confirmations/stream
```

### 7.2 Frontend
- Unit: strategy card renders fees, subscribe button visible only when `!isSubscribed`.  
- Integration:  
  - Subscribe flow: write tx → calls backend subscribe → re-fetch `isSubscribed`.  
  - Broadcast flow: generator page posts `/broadcast` → consumer dashboard receives SSE → item appears in queue.

### 7.3 DB validation
- Check indices exist (query `pg_indexes`).  
- Inserting strategies increments `subscriberCount` on subscribe.  
- `trade_confirmations` created one-per-active-subscriber on broadcast.

---

# 8) File-Specific Transformation Guide

## 8.1 Backend Schemas (`backend/db/schema/`)
- **Remove:** `projects-schema.ts`, `project-submissions-schema.ts` (only if you go clean).  
- **Add:**  
  - `strategies-schema.ts` (NEW)  
  - `trade-confirmations-schema.ts` (NEW)  
  - `subscriptions-schema.ts` (NEW)  
- **Modify:** `index.ts` to export new tables.

## 8.2 Backend Actions (`backend/actions/db/`)
- **Add:** `strategies-actions.ts` (NEW)
```ts
// createStrategyAction, getStrategiesForGenerator, getStrategyById, updateMetrics
```
- **Add:** `subscriptions-actions.ts` (NEW)
```ts
// createOrActivateSubscription, listSubscribers, isActiveSubscriber
```
- **Add:** `confirmations-actions.ts` (NEW)
```ts
// broadcastConfirmationsForStrategy, listPendingForConsumer, markExecuted
```
*(Follow the code style of `projects-actions.ts` / `submissions-actions.ts`—same Drizzle patterns.)*

## 8.3 Backend API Routes (`backend/app/api/`)

**Rename/Replace**
- `/api/projects` → `/api/strategies`  
  - File: **replace** `app/api/projects/route.ts` with `app/api/strategies/route.ts` (shown above).  
- Remove `/api/register/route.ts`.

**New**
- `app/api/strategies/[strategyId]/subscribe/route.ts`
- `app/api/strategies/[strategyId]/subscribers/route.ts`
- `app/api/confirmations/broadcast/route.ts`
- `app/api/consumer/pending-trades/route.ts`
- `app/api/confirmations/stream/route.ts`, `app/api/confirmations/stream/bus.ts`

**Keep**  
- `app/api/api-utils.ts` intact (already standard JSON response + CORS support).  
- `backend/middleware.ts` CORS allowed origins are fine; no auth in middleware needed.

## 8.4 Frontend Services (`frontend/src/services/`)

**New files**
- `strategy-performance.service.ts`
```ts
import axios from 'axios'
const API = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || 'http://localhost:3000'
export const listStrategies = async () => (await axios.get(`${API}/api/strategies`)).data
export const getStrategy = async (id:string) => (await axios.get(`${API}/api/strategies/${id}`)).data
export const getSubscribers = async (id:string) => (await axios.get(`${API}/api/strategies/${id}/subscribers`)).data
// etc.
```

- `subscription.service.ts`
```ts
import axios from 'axios'
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../libs/wagmi-config'
export async function subscribeOnChain(args:{strategyIdHex:string, valueWei:bigint, contract:{address:`0x${string}`, abi:any}}) {
  const hash = await writeContract(config, {
    ...args.contract,
    functionName: 'subscribeToStrategy',
    args: [args.strategyIdHex],
    value: args.valueWei,
  })
  await waitForTransactionReceipt(config, { hash })
  return hash
}
export const registerSubscription = async (id:string, addr:string, txHash:string) =>
  (await axios.post(`/api/strategies/${id}/subscribe`, { alphaConsumerAddress: addr, subscriptionTxHash: txHash })).data
```

- `wallet-auth.service.ts`  
  - If you want a “sign-in” UX (without server sessions), add helper to sign a nonce and store locally. For MVP, wagmi connection is enough.

**Update env var in frontend**
- Replace `NEXT_PUBLIC_LEARNLEDGER_API_URL` usage with `NEXT_PUBLIC_ALPHAENGINE_API_URL`.

---

# 9) Migration Steps (ordered)

1) **DB**  
   - Drop LL tables (if going clean).  
   - Add new schema files; export in `db/schema/index.ts`.  
   - Run bootstrap SQL to create indexes.

2) **Backend API**  
   - Add **new** routes from §2.  
   - Remove `/api/register/route.ts`.  
   - Optionally remove `/app/opencampus/redirect/page.tsx`.  
   - Add SSE bus & route.

3) **Actions**  
   - Create `strategies-actions.ts`, `subscriptions-actions.ts`, `confirmations-actions.ts` with Drizzle queries used by your routes.

4) **Frontend**  
   - Add services: `strategy-performance.service.ts`, `subscription.service.ts`, `wallet-auth.service.ts`.  
   - Add pages under `/alpha-generator/*` and `/alpha-consumer/*`.  
   - Add `StrategyCard.tsx`, `TradeConfirmationList.tsx`.  
   - Point UI to `NEXT_PUBLIC_ALPHAENGINE_API_URL`.  
   - Wire **subscribe** flow: on-chain `subscribeToStrategy` → `POST /subscribe`.

5) **Remove OCID**  
   - Delete `backend/components/utilities/ocid-provider.tsx`.  
   - Remove its imports (e.g., from `components/utilities/nav-bar.tsx`).  
   - Delete `/api/register/route.ts`.

6) **Manual verification**  
   - Create a strategy (POST).  
   - Subscribe with a dummy tx on testnet → POST subscribe.  
   - Broadcast → Confirmations created → SSE received on consumer dashboard.  
   - Execute → mark executed.

---

# 10) Error Handling Patterns

- Use existing `successResponse / errorResponse / serverErrorResponse` from `backend/app/api/api-utils.ts`.  
- Always validate required fields in `POST` (strategyId, address, txHash).  
- When on-chain verification fails or RPC URL is unset → return 400 with clear message.

---

# 11) Architectural Rationale

- **Keep Next structure**: following your existing `app/api/*` and “single repo” approach.  
- **Open API**: consistent with your requirement; wallet gating happens in the client.  
- **SSE over WebSockets**: minimal server code, no third-party infra, good enough for “push” UX.  
- **Polling for blockchain**: simpler and reliable for MVP; can add a worker later.  
- **jsonb blobs**: avoids tight coupling to the external builder; evolvable.

---

# 12) Answers to Your Specific Technical Questions

1) **Strategy JSON structure:** Provided in §2.6. It is intentionally permissive (`version`, `steps[]`, `risk`, `metadata`). You can extend freely.

2) **Subscription verification:**  
   - Frontend: check `isSubscribed(user,strategyId)` on-chain for gating.  
   - Backend: optional tx-receipt check on `POST /subscribe` (already in §2.2).  
   - UI should **not** show confirmations unless `isSubscribed` is true.

3) **Trade broadcast to all subscribers:**  
   - Implemented via `/api/confirmations/broadcast` which writes **one row per active subscriber** and emits **SSE** events to online consumers. No heavy push infra.

4) **Event listening (blockchain):**  
   - Use **polling** in UI (or a future worker) to track `TradeExecuted` if needed. For MVP, confirmations are driven by server `/broadcast` + SSE.

5) **Caching strategy:**  
   - Skipped per your MVP note. (React Query already provides basic client caching.)

---

# 13) Testing Checklist

- **DB**  
  - Tables exist: `strategies`, `subscriptions`, `trade_confirmations`.  
  - Indexes exist (run the `CREATE INDEX` SQL).  

- **Alpha Generator**  
  - Create strategy → appears in `/api/strategies`.  
  - Broadcast → rows created in `trade_confirmations` equal to active subscribers. SSE emits events.

- **Alpha Consumer**  
  - Subscribe flow → tx success → `/subscribe` row stored, `subscriberCount` incremented.  
  - Pending trades → shows confirmations via API → approves/executes (optional endpoint).

- **Security**  
  - No OCID routes or imports remain.  
  - API stays open; wallet gating is client-side.

---

# 14) Rollback Plan

- To revert AlphaEngine DB:  
  - `DROP TABLE trade_confirmations, subscriptions, strategies;`  
  - Restore `projects` / `project_submissions` using current LL schemas.  
- Restore LL routes by re-enabling `/api/projects/*` if you removed them.

---

## 15) Small Implementation Extras (nice-to-have, low effort)

- **Env vars**
  - **Frontend**:  
    - `NEXT_PUBLIC_ALPHAENGINE_API_URL=https://...`  
    - `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`  
    - `NEXT_PUBLIC_CHAIN_ID=11155111` (already in libs)  
    - `NEXT_PUBLIC_RPC_URL=https://...`  
  - **Backend**:  
    - `BLOCKCHAIN_RPC_URL=https://...`  
    - (Optional) `CONTRACT_ADDRESS=0x...`

- **Debug route update**  
  - `backend/app/api/debug/schema/route.ts`: add checks for `strategiesTable`, `subscriptionsTable`, `tradeConfirmationsTable` just like it currently does for LL tables.

---

If you follow this TDD step-by-step, you can drop the LearnLedger DB, stand up the **AlphaEngine** schema, switch your **API endpoints**, replace OCID with **MetaMask**, and light up the **Alpha Generator** side first (strategies → subscribe → broadcast → confirmations).

