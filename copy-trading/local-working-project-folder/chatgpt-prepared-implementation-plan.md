# AlphaEngine Implementation Plan

*File created: 14-September-2025-04:12PM*

## CHANGELOG
- **2025-09-14 16:42 IST**: Formatted and restructured the implementation plan for better readability
- **2025-09-14 16:45 IST**: Added completion checkboxes to track progress for each step
- **2025-09-14 17:57 IST**: Added parallel execution plan and Gantt-style timeline for optimized development
- **2025-09-14 20:08 IST**: Enhanced with detailed parallel execution analysis, Gantt chart, and resource allocation recommendations
- **2025-09-15 11:52 IST**: Updated completion status for backend steps 1-5 as completed
- **2025-09-15 12:36 IST**: Updated completion status for backend steps 6-9 as completed
- **2025-09-15 12:43 IST**: Updated completion status for backend step 10 as completed (OCID cleanup)
- **2025-09-15 16:22 IST**: Updated completion status for frontend steps 14-15 as completed (UI Components and SSE Hook)
- **2025-09-15 16:24 IST**: Verified and updated completion status for frontend steps 11-13 (Service layers already implemented)
- **2025-09-15 16:41 IST**: Completed implementation of frontend steps 16-18 (Alpha Generator and Consumer pages)
- **2025-09-15 17:17 IST**: Verified and marked steps 19-20 as completed (environment variables configured, OCID artifacts removed)
---

## PARALLEL EXECUTION PLAN

### Critical Path Analysis
**Longest Sequential Chain (6 steps)**: Step 1 → Step 2 → Step 6 → Step 7 → Step 8 → Step 21
**Estimated Timeline**: 8 days (reduced from 21 sequential days)

### Phase-Based Development Strategy

#### **Phase 1: Database Foundation (Days 1-2)**
- **Day 1**: Step 1 (Database schemas) - **CRITICAL START**
- **Day 2**: Step 2 (Bootstrap) + Start parallel group A

#### **Phase 2: Backend API Development (Days 2-4)**
- **Parallel Group A** (can start after Step 1):
  - Step 3: `/api/strategies` endpoint
  - Step 4: Subscribe endpoint
  - Step 5: Subscribers endpoint
  - Step 9: Debug schema updates
- **Independent**: Step 10 (OCID cleanup) - can run anytime

#### **Phase 3: Advanced Backend (Days 3-4)**
- **Sequential**: Step 6 → Step 7 → Step 8 (Broadcast → SSE bus → Stream)

#### **Phase 4: Frontend Development (Days 4-7)**
- **Parallel Group B** (Services - can start Day 4):
  - Step 11: Strategy service layer
  - Step 12: Subscription service
  - Step 13: Wallet auth helper
- **Parallel Group C** (UI Components - can start Day 5):
  - Step 14: StrategyCard & TradeConfirmationList components
  - Step 15: SSE client hook
- **Sequential Pages** (Days 6-7):
  - Step 16: Alpha Generator strategies list
  - Step 17: Strategy create page
  - Step 18: Consumer confirmations page
- **Independent Cleanup** (Days 6-7):
  - Step 19: Environment variables
  - Step 20: Frontend OCID cleanup

#### **Phase 5: Integration (Day 8)**
- **Step 21**: End-to-end verification

### Gantt-Style Timeline

```
STEP/DAY:     1    2    3    4    5    6    7    8
==================================================
Step 1:      ████
Step 2:           ████
Step 3:           ██████████
Step 4:           ██████████
Step 5:           ██████████
Step 6:                ████
Step 7:                     ████
Step 8:                          ████
Step 9:           ██████████
Step 10:     ████ ████ ████ ████ (anytime)
Step 11:                ██████████
Step 12:                ██████████
Step 13:                ██████████
Step 14:                     ██████████
Step 15:                     ██████████
Step 16:                          ████
Step 17:                               ████
Step 18:                               ████
Step 19:                          ██████████
Step 20:                          ██████████
Step 21:                                    ████
```

### Dependencies Matrix

| Step | Prerequisites | Can Run Parallel With | Blocks |
|------|---------------|----------------------|--------|
| 1 | None | Step 10 | Steps 2-9 |
| 2 | Step 1 | Steps 3,4,5,9,10 | Step 6 |
| 3 | Step 1 | Steps 2,4,5,9,10 | Step 4 |
| 4 | Steps 1,3 | Steps 2,5,9,10 | Step 6 |
| 5 | Steps 1-4 | Steps 2,9,10 | Step 6 |
| 6 | Steps 1-5 | Step 10 | Step 7 |
| 7 | Step 6 | Step 10 | Step 8 |
| 8 | Step 7 | Step 10 | Frontend steps |
| 9 | Step 1 | Steps 2,3,4,5,10 | None |
| 10 | None | All other steps | None |
| 11-13 | Backend API specs | Each other | Steps 14-15 |
| 14-15 | Steps 11-13 | Each other | Steps 16-18 |
| 16-18 | Steps 14-15 | Steps 19-20 | Step 21 |
| 19-20 | Steps 11-13 | Each other, Steps 16-18 | None |
| 21 | Steps 1-20 | None | None |

### Resource Allocation Recommendations

#### **2-Developer Team Optimal Split:**

**Developer A (Backend Focus):**
- Days 1-2: Steps 1, 2
- Days 2-3: Steps 3, 4, 5 (parallel)
- Days 3-4: Steps 6, 7, 8 (sequential)
- Days 4-8: Support frontend integration, Step 10

**Developer B (Frontend Focus):**
- Days 1-3: Step 10, environment setup, design planning
- Days 4-5: Steps 11, 12, 13 (services layer)
- Days 5-6: Steps 14, 15 (UI components)
- Days 6-7: Steps 16, 17, 18 (pages)
- Days 7-8: Steps 19, 20, integration support

#### **Single Developer Workflow:**
Follow the Gantt timeline, focusing on parallel groups during each phase to maximize efficiency.

---

## BACKEND PLAN

### Step 1: Create AlphaEngine DB schemas (strategies, subscriptions, trade_confirmations) - [x] ✅

**Task**: Add three new Drizzle schema files and export them from the schema index.

**EXPLANATION**:
- **What** → Introduce `strategies`, `subscriptions`, and `trade_confirmations` tables required by AlphaEngine.
- **Where** → `backend/db/schema/strategies-schema.ts`, `backend/db/schema/subscriptions-schema.ts`, `backend/db/schema/trade-confirmations-schema.ts`, and update `backend/db/schema/index.ts`.
- **Why** → These tables model strategies, paid access via subscriptions, and broadcasted trade confirmations for consumers.

**Files to Check/Create/Update**:
- `backend/db/schema/strategies-schema.ts`
- `backend/db/schema/subscriptions-schema.ts`
- `backend/db/schema/trade-confirmations-schema.ts`
- `backend/db/schema/index.ts`

**Step Dependencies**: None

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 11:52

**Status:** ✅ Completed

**Prompt for verification**: "List tables in Postgres and confirm that `strategies`, `subscriptions`, and `trade_confirmations` exist with the exact columns as in the TDD. Validate Drizzle types match."

**Files Modified/Created:**

#### backend/db/schema/strategies-schema.ts
```ts
// @ts-nocheck
import { pgTable, text, varchar, boolean, timestamp, jsonb, numeric, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const strategiesTable = pgTable("strategies", {
  strategyId: text("strategy_id").primaryKey().default(sql`gen_random_uuid()`),
  strategyName: varchar("strategy_name", { length: 255 }),
  strategyDescription: text("strategy_description"),
  subscriptionFee: varchar("subscription_fee"),
  supportedProtocols: jsonb("supported_protocols"),
  strategyJSON: jsonb("strategy_json"),
  alphaGeneratorAddress: text("alpha_generator_address"),
  subscriberCount: integer("subscriber_count").default(0).notNull(),
  totalVolume: numeric("total_volume", { precision: 78, scale: 0 }).default("0"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export type Strategy = typeof strategiesTable.$inferSelect;
export type NewStrategy = typeof strategiesTable.$inferInsert;
```

#### backend/db/schema/subscriptions-schema.ts
```ts
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

#### backend/db/schema/trade-confirmations-schema.ts
```ts
// @ts-nocheck
import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tradeConfirmationsTable = pgTable("trade_confirmations", {
  confirmationId: text("confirmation_id").primaryKey().default(sql`gen_random_uuid()`),
  strategyId: text("strategy_id").notNull(),
  alphaConsumerAddress: text("alpha_consumer_address").notNull(),
  executionParams: jsonb("execution_params"),
  gasEstimate: text("gas_estimate"),
  isExecuted: boolean("is_executed").default(false).notNull(),
  executionTxHash: text("execution_tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export type TradeConfirmation = typeof tradeConfirmationsTable.$inferSelect;
export type NewTradeConfirmation = typeof tradeConfirmationsTable.$inferInsert;
```

#### backend/db/schema/index.ts (append the following exports at the bottom)
```ts
export * from './strategies-schema'
export * from './subscriptions-schema'
export * from './trade-confirmations-schema'
```

**Summary of Changes & Reasoning:** Introduces normalized tables focused on MVP core flows; uses `jsonb` for strategy and execution payload flexibility and wei-like numeric/string fields to avoid precision loss.

---

### Step 2: Bootstrap indexes and (optionally) drop LearnLedger tables - [x] ✅

**Task**: Add a one-off debug route to execute index creation SQL and optionally drop LL tables.

**EXPLANATION**:
- **What** → Create `app/api/debug/bootstrap/route.ts` that runs SQL for indexes and (optional) cleanup.
- **Where** → `backend/app/api/debug/bootstrap/route.ts`
- **Why** → Ensures performant queries and a clean slate without manual psql work.

**Files to Check/Create/Update**: `backend/app/api/debug/bootstrap/route.ts`

**Step Dependencies**: Step 1

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 11:52

**Status:** ✅ Completed

**Prompt for verification**: "Hit `/api/debug/bootstrap` and verify JSON shows `indexesCreated:true` and (if enabled) `tablesDropped:true`. Confirm indexes via `pg_indexes`."

**Files Modified/Created:**

#### backend/app/api/debug/bootstrap/route.ts
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'

export async function GET(req: NextRequest) {
  const doDrop = req.nextUrl.searchParams.get('drop') === 'true'
  const statements: string[] = [
    // indexes
    `CREATE INDEX IF NOT EXISTS idx_strategies_generator ON strategies (alpha_generator_address);`,
    `CREATE INDEX IF NOT EXISTS idx_strategies_active ON strategies (is_active);`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_strategy ON subscriptions (strategy_id);`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_consumer ON subscriptions (alpha_consumer_address);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ux_one_sub_per_strategy ON subscriptions (strategy_id, alpha_consumer_address) WHERE is_active = true;`,
    `CREATE INDEX IF NOT EXISTS idx_conf_consumer_executed ON trade_confirmations (alpha_consumer_address, is_executed);`,
    `CREATE INDEX IF NOT EXISTS idx_conf_strategy ON trade_confirmations (strategy_id);`,
  ]
  const drops = [
    `DROP TABLE IF EXISTS project_submissions CASCADE;`,
    `DROP TABLE IF EXISTS projects CASCADE;`
  ]
  try {
    for (const s of statements) await db.execute(s)
    if (doDrop) for (const d of drops) await db.execute(d)
    return new Response(JSON.stringify({ isSuccess: true, indexesCreated: true, tablesDropped: doDrop }), { status: 200, headers: { 'Content-Type': 'application/json' }})
  } catch (e: any) {
    return new Response(JSON.stringify({ isSuccess: false, message: e?.message }), { status: 500, headers: { 'Content-Type': 'application/json' }})
  }
}
```

**Summary of Changes & Reasoning:** Adds repeatable, idempotent bootstrap endpoint to set indexes and optionally purge LL tables to align with clean-slate directive.

---

### Step 3: Implement `/api/strategies` (GET list, POST create) - [x] ✅

**Task**: Replace projects route with a new strategies route file handling list and create.

**EXPLANATION**:
- **What** → New REST endpoint `/api/strategies` with GET and POST handlers.
- **Where** → `backend/app/api/strategies/route.ts`
- **Why** → Enables Alpha Generators to import strategies from the external builder and list them.

**Files to Check/Create/Update**: `backend/app/api/strategies/route.ts`

**Step Dependencies**: Step 1

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 11:52

**Status:** ✅ Completed

**Prompt for verification**: "POST a sample strategy and GET list; verify fields match schema and timestamps are set."

**Files Modified/Created:**

#### backend/app/api/strategies/route.ts
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { desc } from 'drizzle-orm'
import { successResponse, serverErrorResponse } from '@/app/api/api-utils'

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

**Summary of Changes & Reasoning:** Mirrors the LearnLedger style but targets AlphaEngine entities; leverages existing `api-utils` for consistent envelopes and CORS.

---

### Step 4: Implement `/api/strategies/[strategyId]/subscribe` (tx verification + DB record) - [x] ✅

**Task**: Create the subscription route to verify payment tx (optional) and persist the subscription.

**EXPLANATION**:
- **What** → Open POST endpoint to store subscription using on-chain tx hash; increments subscriberCount.
- **Where** → `backend/app/api/strategies/[strategyId]/subscribe/route.ts`
- **Why** → Paid access is the gate to copy-trading features.

**Files to Check/Create/Update**: `backend/app/api/strategies/[strategyId]/subscribe/route.ts`

**Step Dependencies**: Steps 1–3

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 11:52

**Status:** ✅ Completed

**Prompt for verification**: "Call the endpoint with a real/fake txHash; ensure duplicate active subscription returns 'Already subscribed'."

**Files Modified/Created:**

#### backend/app/api/strategies/[strategyId]/subscribe/route.ts
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { sql, and, eq } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'
import { ethers } from 'ethers'

export async function POST(req: NextRequest, { params }: { params: { strategyId: string }}) {
  try {
    const strategyId = params.strategyId
    const { alphaConsumerAddress, subscriptionTxHash } = await req.json()

    if (!alphaConsumerAddress || !subscriptionTxHash) {
      return errorResponse('alphaConsumerAddress and subscriptionTxHash are required', 400, req)
    }

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

    const [row] = await db.insert(subscriptionsTable).values({
      strategyId,
      alphaConsumerAddress,
      subscriptionTxHash,
      isActive: true
    }).returning()

    await db.execute(sql`UPDATE strategies SET subscriber_count = subscriber_count + 1 WHERE strategy_id = ${strategyId}`)
    return successResponse(row, 'Subscribed', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}
```

**Summary of Changes & Reasoning:** Minimal, deterministic verification and idempotent handling align with MVP; keeps APIs open while relying on wallet gating at the UI.

---

### Step 5: Implement `/api/strategies/[strategyId]/subscribers` (GET) - [x] ✅

**Task**: Provide list of active subscribers for a strategy.

**EXPLANATION**:
- **What** → Endpoint returns `{ alphaConsumerAddress, subscribedAt, isActive }[]`.
- **Where** → `backend/app/api/strategies/[strategyId]/subscribers/route.ts`
- **Why** → Needed by generator dashboards and detail pages.

**Files to Check/Create/Update**: `backend/app/api/strategies/[strategyId]/subscribers/route.ts`

**Step Dependencies**: Steps 1–4

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 11:52

**Status:** ✅ Completed

**Prompt for verification**: "Verify that a just-subscribed wallet appears in the list and timestamps are correct."

**Files Modified/Created:**

#### backend/app/api/strategies/[strategyId]/subscribers/route.ts
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { eq } from 'drizzle-orm'
import { successResponse, serverErrorResponse } from '@/app/api/api-utils'

export async function GET(req: NextRequest, { params }: { params: { strategyId: string } }) {
  try {
    const data = await db.select({
      alphaConsumerAddress: subscriptionsTable.alphaConsumerAddress,
      subscribedAt: subscriptionsTable.subscribedAt,
      isActive: subscriptionsTable.isActive
    }).from(subscriptionsTable).where(eq(subscriptionsTable.strategyId, params.strategyId))
    return successResponse(data, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}
```

**Summary of Changes & Reasoning:** Simple list to power generator views and optional gating checks.

---

### Step 6: Implement `/api/confirmations/broadcast` (POST) - [x] ✅

**Task**: Create one confirmation per active subscriber and emit SSE for real-time delivery.

**EXPLANATION**:
- **What** → For given `strategyId` and `executionParams`, write rows in `trade_confirmations`; push SSE events.
- **Where** → `backend/app/api/confirmations/broadcast/route.ts`
- **Why** → Core Alpha Generator→Consumer delivery loop.

**Files to Check/Create/Update**: `backend/app/api/confirmations/broadcast/route.ts`

**Step Dependencies**: Steps 1–5

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 12:36

**Status:** ✅ Completed

**Prompt for verification**: "Create a strategy with two subscribers, broadcast once, verify two rows were created and SSE events fired."

**Files Modified/Created:**

#### backend/app/api/confirmations/broadcast/route.ts
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { eq } from 'drizzle-orm'
import { successResponse, serverErrorResponse } from '@/app/api/api-utils'
import { emitConfirmationEvent } from '@/app/api/confirmations/stream/bus'

export async function POST(req: NextRequest) {
  try {
    const { strategyId, executionParams, gasEstimate } = await req.json()
    const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.strategyId, strategyId))
    if (!subs.length) return successResponse({ created: 0 }, 'No subscribers', 200, req)

    let created = 0
    for (const s of subs) {
      const [row] = await db.insert(tradeConfirmationsTable).values({
        strategyId,
        alphaConsumerAddress: s.alphaConsumerAddress,
        executionParams,
        gasEstimate
      }).returning()
      created += 1
      emitConfirmationEvent(row)
    }
    return successResponse({ created }, 'Broadcasted', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}
```

**Summary of Changes & Reasoning:** Fan-out write plus SSE signal provides immediate UX with minimal infra.

---

### Step 7: Implement SSE event bus and stream endpoint - [x] ✅

**Task**: Add `bus.ts` (EventEmitter) and `/api/confirmations/stream` route for client subscriptions.

**EXPLANATION**:
- **What** → Server-Sent Events for push notifications of new confirmations.
- **Where** → `backend/app/api/confirmations/stream/bus.ts` and `backend/app/api/confirmations/stream/route.ts`
- **Why** → Real-time UX without WebSocket infra.

**Files to Check/Create/Update**:
- `backend/app/api/confirmations/stream/bus.ts`
- `backend/app/api/confirmations/stream/route.ts`

**Step Dependencies**: Step 6

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 12:36

**Status:** ✅ Completed

**Prompt for verification**: "Connect with curl `-N` to `/api/confirmations/stream`, broadcast once, and confirm an SSE message is received."

**Files Modified/Created:**

#### backend/app/api/confirmations/stream/bus.ts
```ts
import { EventEmitter } from 'node:events'
const bus = new EventEmitter()
export const emitConfirmationEvent = (payload: any) => bus.emit('confirmation', payload)
export const subscribe = (fn: (p: any) => void) => { bus.on('confirmation', fn); return () => bus.off('confirmation', fn) }
```

#### backend/app/api/confirmations/stream/route.ts
```ts
import { NextRequest } from 'next/server'
import { subscribe } from './bus'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      const send = (data: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
      const unsub = subscribe(send)
      const heart = setInterval(() => controller.enqueue(enc.encode(`: ping\n\n`)), 15000)
      // cleanup (Note: Response/ReadableStream closing will trigger cancel)
      // @ts-ignore
      stream.cancel = () => { clearInterval(heart); unsub() }
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

**Summary of Changes & Reasoning:** Minimal event bus avoids external dependencies; SSE works well in app router.

---

### Step 8: Implement `/api/consumer/pending-trades` (GET) - [x] ✅

**Task**: Create endpoint to fetch unexecuted trade confirmations for a consumer.

**EXPLANATION**:
- **What** → Returns list where `isExecuted=false` filtered by `alphaConsumerAddress`.
- **Where** → `backend/app/api/consumer/pending-trades/route.ts`
- **Why** → Powers consumer dashboard queue.

**Files to Check/Create/Update**: `backend/app/api/consumer/pending-trades/route.ts`

**Step Dependencies**: Steps 1, 6

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 12:36

**Status:** ✅ Completed

**Prompt for verification**: "Create two confirmations for a wallet; verify both are returned until marked executed."

**Files Modified/Created:**

#### backend/app/api/consumer/pending-trades/route.ts
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export async function GET(req: NextRequest) {
  try {
    const addr = req.nextUrl.searchParams.get('alphaConsumerAddress')
    if (!addr) return errorResponse('alphaConsumerAddress is required', 400, req)
    const data = await db.select().from(tradeConfirmationsTable).where(
      and(eq(tradeConfirmationsTable.alphaConsumerAddress, addr), eq(tradeConfirmationsTable.isExecuted, false))
    )
    return successResponse(data, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}
```

**Summary of Changes & Reasoning:** Simple filter endpoint aligns to MVP and keeps client logic straightforward.

---

### Step 9: Update debug schema route to include new tables - [x] ✅

**Task**: Extend existing `app/api/debug/schema/route.ts` to list/check AlphaEngine tables.

**EXPLANATION**:
- **What** → Add checks for `strategies`, `subscriptions`, `trade_confirmations`.
- **Where** → `backend/app/api/debug/schema/route.ts`
- **Why** → Quick health check endpoint for DB shape during migration.

**Files to Check/Create/Update**: `backend/app/api/debug/schema/route.ts`

**Step Dependencies**: Step 1

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 12:36

**Status:** ✅ Completed

**Prompt for verification**: "Fetch `/api/debug/schema` and confirm the new tables appear with correct columns."

**Files Modified/Created:**

#### backend/app/api/debug/schema/route.ts (replace file content)
```ts
import { NextRequest } from 'next/server'
import { db } from '@/db/db'

export async function GET(req: NextRequest) {
  try {
    const tables = await db.execute(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
    const cols = async (t: string) => (await db.execute(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='${t}' ORDER BY ordinal_position`)).rows
    const tableList = tables.rows.map((r: any) => r.table_name)
    const details: any = {}
    for (const t of ['strategies', 'subscriptions', 'trade_confirmations']) {
      if (tableList.includes(t)) details[t] = await cols(t)
    }
    return new Response(JSON.stringify({ isSuccess: true, tables: tableList, details }), { status: 200, headers: { 'Content-Type': 'application/json' }})
  } catch (e: any) {
    return new Response(JSON.stringify({ isSuccess: false, message: e?.message }), { status: 500, headers: { 'Content-Type': 'application/json' }})
  }
}
```

**Summary of Changes & Reasoning:** Enhances existing debug utility to verify migration success without external tools.

---

### Step 10: Remove OCID backend artifacts and `/api/register` - [x] ✅

**Task**: Delete OCID provider and register route, and strip related imports.

**EXPLANATION**:
- **What** → Delete `backend/components/utilities/ocid-provider.tsx` and `backend/app/api/register/route.ts`, and remove OCID usages in nav-bar.
- **Where** → `backend/components/utilities/ocid-provider.tsx`, `backend/app/api/register/route.ts`, `backend/components/utilities/nav-bar.tsx`
- **Why** → Wallet-only auth; no server auth is required.

**Files to Check/Create/Update**:
- (deleted) `backend/components/utilities/ocid-provider.tsx`
- (deleted) `backend/app/api/register/route.ts`
- (update) `backend/components/utilities/nav-bar.tsx`

**Step Dependencies**: None

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 12:43

**Status:** ✅ Completed

**Prompt for verification**: "Search the repo for 'ocid' and 'OpenCampus'; expect zero results."

**Files Modified/Created:**

#### backend/components/utilities/nav-bar.tsx (replace imports referencing OCID)
```tsx
"use client"
import React from 'react'
// NOTE: Removed OCID imports. Keep wallet indicator minimal or remove entirely for backend app UI.
export default function NavBar() {
  return (
    <nav className="w-full px-4 py-2 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="font-semibold">AlphaEngine (Backend Admin)</div>
        <div className="text-sm opacity-70">Server Tools</div>
      </div>
    </nav>
  )
}
```

**Summary of Changes & Reasoning:** Ensures backend has no stale OCID code; simplifies UI elements per wallet-only approach (handled on frontend).

---

## FRONTEND PLAN

### Step 11: Create strategy service layer - [x] ✅

**Task**: Add `strategy-performance.service.ts` for listing, fetching, and subscriber queries.

**EXPLANATION**:
- **What** → Axios-based wrappers for `/api/strategies` endpoints.
- **Where** → `frontend/src/services/strategy-performance.service.ts`
- **Why** → Centralize API calls; easy to swap base URL.

**Files to Check/Create/Update**: `frontend/src/services/strategy-performance.service.ts`

**Step Dependencies**: Backend Steps 3, 5

**Step Completion Summary (YYYY-MM-DD HH:MM)**: Already implemented (more robust version)

**Status:** ✅ Completed

**Prompt for verification**: "Call `listStrategies()` and confirm it returns the strategy created in Step 3."

**Files Modified/Created:**

#### frontend/src/services/strategy-performance.service.ts
```ts
import axios from 'axios'
const API = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || ''
export const listStrategies = async () => (await axios.get(`${API}/api/strategies`)).data
export const getStrategy = async (id: string) => (await axios.get(`${API}/api/strategies/${id}`)).data
export const getSubscribers = async (id: string) => (await axios.get(`${API}/api/strategies/${id}/subscribers`)).data
```

**Summary of Changes & Reasoning:** Slim, focused service aligns to MVP endpoints and environment-driven base URL.

---

### Step 12: Create subscription service layer (on-chain + backend registration) - [x] ✅

**Task**: Add `subscription.service.ts` using wagmi for contract write and axios for server registration.

**EXPLANATION**:
- **What** → `subscribeOnChain()` (wagmi write + receipt), `registerSubscription()` (POST to backend).
- **Where** → `frontend/src/services/subscription.service.ts`
- **Why** → Encapsulate two-step subscription flow.

**Files to Check/Create/Update**: `frontend/src/services/subscription.service.ts`

**Step Dependencies**: Backend Step 4

**Step Completion Summary (YYYY-MM-DD HH:MM)**: Already implemented (enhanced version)

**Status:** ✅ Completed

**Prompt for verification**: "Run a real or test tx using `subscribeOnChain()`, then `registerSubscription()`. Confirm DB reflects new subscription."

**Files Modified/Created:**

#### frontend/src/services/subscription.service.ts
```ts
import axios from 'axios'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../libs/wagmi-config'

export async function subscribeOnChain(args: {
  strategyIdHex: `0x${string}`,
  valueWei: bigint,
  contract: { address: `0x${string}`, abi: any }
}) {
  const hash = await writeContract(config, {
    ...args.contract,
    functionName: 'subscribeToStrategy',
    args: [args.strategyIdHex],
    value: args.valueWei,
  })
  await waitForTransactionReceipt(config, { hash })
  return hash
}

export const registerSubscription = async (id: string, addr: string, txHash: string) => {
  const API = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || ''
  return (await axios.post(`${API}/api/strategies/${id}/subscribe`, {
    alphaConsumerAddress: addr,
    subscriptionTxHash: txHash
  })).data
}
```

**Summary of Changes & Reasoning:** Matches TDD two-phase subscription model; agnostic to chain signer since wagmi config exists.

---

### Step 13: Add wallet auth helper (optional sign message UX) - [x] ✅

**Task**: Provide `wallet-auth.service.ts` for optional client-side "sign-in".

**EXPLANATION**:
- **What** → Adds sign/verify stubs to unify UX; no server session created.
- **Where** → `frontend/src/services/wallet-auth.service.ts`
- **Why** → Ready-to-use pattern for future off-chain approvals.

**Files to Check/Create/Update**: `frontend/src/services/wallet-auth.service.ts`

**Step Dependencies**: None

**Step Completion Summary (YYYY-MM-DD HH:MM)**: Already implemented

**Status:** ✅ Completed

**Prompt for verification**: "Call `signMessage()` and verify that the returned signature matches the connected address using `verifyMessage` (local only)."

**Files Modified/Created:**

#### frontend/src/services/wallet-auth.service.ts
```ts
import { signMessage, verifyMessage, getAccount } from '@wagmi/core'
import { config } from '../libs/wagmi-config'

export async function signMessageForLogin(message = 'Sign to use AlphaEngine') {
  const signature = await signMessage(config, { message })
  return { signature }
}

export async function verifyLastSignature(message: string, signature: `0x${string}`) {
  const { address } = getAccount(config)
  const verified = await verifyMessage({ address, message, signature })
  return { verified, address }
}
```

**Summary of Changes & Reasoning:** Lays groundwork for future signed actions, keeping server endpoints open per MVP.

---

### Step 14: Create StrategyCard and TradeConfirmationList components - [x] ✅

**Task**: Add reusable UI for strategy display and pending confirmations.

**EXPLANATION**:
- **What** → Two components under `src/Components/`.
- **Where** → `frontend/src/Components/StrategyCard.tsx`, `frontend/src/Components/TradeConfirmationList.tsx`
- **Why** → Reuse across pages (marketplace, dashboards).

**Files to Check/Create/Update**:
- `frontend/src/Components/StrategyCard.tsx`
- `frontend/src/Components/TradeConfirmationList.tsx`

**Step Dependencies**: Steps 11–12

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 16:22

**Status:** ✅ Completed

**Prompt for verification**: "Render StrategyCard with mock props; render TradeConfirmationList with two items and verify layout."

**Files Modified/Created:**

#### frontend/src/Components/StrategyCard.tsx
```tsx
import React from 'react'

export interface StrategyCardProps {
  strategyId: string
  strategyName: string
  subscriptionFee: string
  supportedProtocols: string[]
  subscriberCount: number
  totalVolumeWei: string
  isActive: boolean
  onSubscribe?: () => void
}

export default function StrategyCard(props: StrategyCardProps) {
  const {
    strategyName, subscriptionFee, supportedProtocols,
    subscriberCount, totalVolumeWei, isActive, onSubscribe
  } = props

  return (
    <div className="border rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{strategyName}</h3>
        <span className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="text-sm opacity-80">
        Protocols: {supportedProtocols?.join(', ') || '—'}
      </div>
      <div className="text-sm">Subscription Fee (wei): {subscriptionFee}</div>
      <div className="text-sm">Subscribers: {subscriberCount} • Total Volume (wei): {totalVolumeWei}</div>
      {onSubscribe && <button className="mt-2 px-3 py-2 rounded bg-black text-white" onClick={onSubscribe}>Subscribe</button>}
    </div>
  )
}
```

#### frontend/src/Components/TradeConfirmationList.tsx
```tsx
import React from 'react'

export interface TradeConfirmationItem {
  confirmationId: string
  strategyId: string
  executionParams: any
  gasEstimate?: string
}

export default function TradeConfirmationList({ items, onApprove }: {
  items: TradeConfirmationItem[], onApprove?: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.confirmationId} className="border rounded-xl p-4">
          <div className="text-xs opacity-70">Strategy: {it.strategyId}</div>
          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(it.executionParams, null, 2)}
          </pre>
          {it.gasEstimate && <div className="text-xs mt-1">Gas Estimate: {it.gasEstimate}</div>}
          {onApprove && <button className="mt-2 px-3 py-2 rounded bg-black text-white" onClick={() => onApprove(it.confirmationId)}>Approve & Execute</button>}
        </div>
      ))}
      {!items.length && <div className="text-sm opacity-70">No pending confirmations.</div>}
    </div>
  )
}
```

**Summary of Changes & Reasoning:** Provides clean, reusable UI widgets that can be dropped into multiple pages quickly.

---

### Step 15: Add SSE client hook for real-time confirmations - [x] ✅

**Task**: Create `useConfirmationsSSE.ts` to consume `/api/confirmations/stream`.

**EXPLANATION**:
- **What** → Hook manages EventSource lifecycle and incoming events.
- **Where** → `frontend/src/hooks/useConfirmationsSSE.ts`
- **Why** → Simplifies integrating SSE into any page.

**Files to Check/Create/Update**: `frontend/src/hooks/useConfirmationsSSE.ts`

**Step Dependencies**: Backend Step 7

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 16:22

**Status:** ✅ Completed

**Prompt for verification**: "Open a page using this hook; broadcast; verify new confirmation appended without reload."

**Files Modified/Created:**

#### frontend/src/hooks/useConfirmationsSSE.ts
```ts
import { useEffect } from 'react'

export function useConfirmationsSSE(onMessage: (data: any) => void) {
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || ''
    const es = new EventSource(`${api}/api/confirmations/stream`)
    es.onmessage = (ev) => {
      try { onMessage(JSON.parse(ev.data)) } catch {}
    }
    es.onerror = () => { /* no-op or reconnection logic */ }
    return () => es.close()
  }, [onMessage])
}
```

**Summary of Changes & Reasoning:** Abstracts SSE wiring; promotes consistency across dashboards.

---

### Step 16: Create Alpha Generator strategies list page - [x] ✅

**Task**: Add `/alpha-generator/strategies/index.tsx` listing with StrategyCard.

**EXPLANATION**:
- **What** → New page reads strategies via service and renders cards.
- **Where** → `frontend/src/pages/alpha-generator/strategies/index.tsx`
- **Why** → Primary generator UI for viewing/importing strategies.

**Files to Check/Create/Update**: `frontend/src/pages/alpha-generator/strategies/index.tsx`

**Step Dependencies**: Steps 11, 14

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 16:41

**Status:** ✅ Completed

**Prompt for verification**: "Visit the page; verify newly created strategy from Step 3 appears."

**Files Modified/Created:**

#### frontend/src/pages/alpha-generator/strategies/index.tsx
```tsx
import React, { useEffect, useState } from 'react'
import { listStrategies } from '@/services/strategy-performance.service'
import StrategyCard from '@/Components/StrategyCard'

export default function GeneratorStrategiesPage() {
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => { (async () => {
    const res = await listStrategies()
    setRows(res.data || [])
  })() }, [])
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Your Strategies</h1>
      <div className="grid gap-4">
        {rows.map((r) => (
          <StrategyCard
            key={r.strategyId}
            strategyId={r.strategyId}
            strategyName={r.strategyName}
            subscriptionFee={r.subscriptionFee}
            supportedProtocols={r.supportedProtocols || []}
            subscriberCount={r.subscriberCount || 0}
            totalVolumeWei={r.totalVolume || '0'}
            isActive={r.isActive}
          />
        ))}
        {!rows.length && <div className="opacity-70 text-sm">No strategies yet.</div>}
      </div>
    </div>
  )
}
```

**Summary of Changes & Reasoning:** Quick, read-only list to validate back-end strategy creation and display fundamentals.

---

### Step 17: Create Alpha Generator strategy create page - [x] ✅

**Task**: Add `/alpha-generator/strategies/create/index.tsx` with a minimal form to POST `/api/strategies`.

**EXPLANATION**:
- **What** → Form fields for name, description, fee, protocols, and strategyJSON.
- **Where** → `frontend/src/pages/alpha-generator/strategies/create/index.tsx`
- **Why** → Allows importing strategy JSON from external builder.

**Files to Check/Create/Update**: `frontend/src/pages/alpha-generator/strategies/create/index.tsx`

**Step Dependencies**: Backend Step 3

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 16:41

**Status:** ✅ Completed

**Prompt for verification**: "Create a strategy; then confirm it appears on the strategies list page."

**Files Modified/Created:**

#### frontend/src/pages/alpha-generator/strategies/create/index.tsx
```tsx
import React, { useState } from 'react'
import axios from 'axios'
const API = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || ''

export default function CreateStrategyPage() {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [fee, setFee] = useState('0')
  const [protocols, setProtocols] = useState('["Uniswap"]')
  const [json, setJson] = useState('{"version":"1.0","steps":[]}')
  const [addr, setAddr] = useState('0x')

  const submit = async () => {
    const body = {
      strategyName: name,
      strategyDescription: desc,
      subscriptionFee: fee,
      supportedProtocols: JSON.parse(protocols),
      strategyJSON: JSON.parse(json),
      alphaGeneratorAddress: addr
    }
    await axios.post(`${API}/api/strategies`, body)
    alert('Created!')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-3">
      <h1 className="text-xl font-semibold">Import Strategy</h1>
      <input className="border rounded p-2 w-full" placeholder="Strategy Name" value={name} onChange={e => setName(e.target.value)} />
      <textarea className="border rounded p-2 w-full" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
      <input className="border rounded p-2 w-full" placeholder="Subscription Fee (wei)" value={fee} onChange={e => setFee(e.target.value)} />
      <input className="border rounded p-2 w-full" placeholder='["Uniswap","Aave"]' value={protocols} onChange={e => setProtocols(e.target.value)} />
      <textarea className="border rounded p-2 w-full h-40" placeholder='strategyJSON' value={json} onChange={e => setJson(e.target.value)} />
      <input className="border rounded p-2 w-full" placeholder="Alpha Generator Address (0x...)" value={addr} onChange={e => setAddr(e.target.value)} />
      <button className="px-3 py-2 rounded bg-black text-white" onClick={submit}>Create</button>
    </div>
  )
}
```

**Summary of Changes & Reasoning:** Minimal, developer-friendly entry point to seed strategies during MVP.

---

### Step 18: Create Alpha Consumer confirmations page (pending + SSE) - [x] ✅

**Task**: Add `/alpha-consumer/confirmations/index.tsx` to poll/push pending trades.

**EXPLANATION**:
- **What** → Page shows unexecuted confirmations and subscribes to SSE.
- **Where** → `frontend/src/pages/alpha-consumer/confirmations/index.tsx`
- **Why** → Central consumer UX for approving trades.

**Files to Check/Create/Update**: `frontend/src/pages/alpha-consumer/confirmations/index.tsx`

**Step Dependencies**: Backend Steps 6–8, Frontend Steps 14–15

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 16:41

**Status:** ✅ Completed

**Prompt for verification**: "Open two browser tabs as two consumers; broadcast a trade; both see the new item via SSE without refresh."

**Files Modified/Created:**

#### frontend/src/pages/alpha-consumer/confirmations/index.tsx
```tsx
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import TradeConfirmationList, { TradeConfirmationItem } from '@/Components/TradeConfirmationList'
import { useConfirmationsSSE } from '@/hooks/useConfirmationsSSE'

const API = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || ''

export default function ConsumerConfirmationsPage() {
  const [addr, setAddr] = useState('0x') // wire to wagmi useAccount() in real UI
  const [items, setItems] = useState<TradeConfirmationItem[]>([])

  const fetchPending = useCallback(async () => {
    if (!addr || addr === '0x') return
    const res = await axios.get(`${API}/api/consumer/pending-trades`, { params: { alphaConsumerAddress: addr } })
    setItems(res.data?.data || [])
  }, [addr])

  useEffect(() => { fetchPending() }, [fetchPending])

  useConfirmationsSSE((data) => {
    // naive: if the event is for me, refresh list
    if (data?.alphaConsumerAddress?.toLowerCase() === addr.toLowerCase()) fetchPending()
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Pending Trade Confirmations</h1>
      <input className="border rounded p-2 w-full" placeholder="Your Wallet Address (0x...)" value={addr} onChange={e => setAddr(e.target.value)} />
      <TradeConfirmationList items={items} />
    </div>
  )
}
```

**Summary of Changes & Reasoning:** Demonstrates the MVP push model—SSE triggers refresh; page is simple to integrate with wagmi later.

---

### Step 19: Wire environment variables and base URL - [x] ✅

**Task**: Ensure `NEXT_PUBLIC_ALPHAENGINE_API_URL` is used by all services; document required envs.

**EXPLANATION**:
- **What** → Confirm all new services derive base URL from env; add `.env.development` sample if needed.
- **Where** → `frontend/.env.development`, service files already created
- **Why** → Local/remote parity without code changes.

**Files to Check/Create/Update**: `frontend/.env.development`

**Step Dependencies**: Steps 11–13

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 17:17

**Status:** ✅ Completed

**Prompt for verification**: "Unset the env and verify requests hit relative `/api/...`; set the env and confirm requests hit the remote base."

**Files Modified/Created:**

#### frontend/.env.development
```dotenv
NEXT_PUBLIC_ALPHAENGINE_API_URL=http://localhost:3000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/<YOUR_KEY>
```

**Summary of Changes & Reasoning:** Centralizes API target selection and prepares for different deployments.

---

### Step 20: Remove OCID artifacts from frontend (if referenced) - [x] ✅

**Task**: Remove any OCID-specific code and routes in frontend login; prefer wallet connect.

**EXPLANATION**:
- **What** → Delete OCID references; keep wagmi connect UI.
- **Where** → `frontend/src/pages/login/*` if referencing OCID; any components importing OCID provider.
- **Why** → Align with wallet-only auth and open endpoints.

**Files to Check/Create/Update**: (delete or edit) `frontend/src/pages/login/*`, any OCID imports

**Step Dependencies**: None

**Step Completion Summary (YYYY-MM-DD HH:MM)**: 2025-09-15 17:17

**Status:** ✅ Completed

**Prompt for verification**: "Search for 'OCID' in the frontend; expect zero results."

**Files Modified/Created:** (Deletions / small edits; no code snippet required)

**Summary of Changes & Reasoning:** Keeps frontend consistent with wallet-gated UX and avoids dead code.

---

### Step 21: Manual end-to-end verification - [ ]

**Task**: Run through Alpha Generator and Consumer flows end-to-end.

**EXPLANATION**:
- **What** → Create strategy → subscribe on-chain → register → broadcast → receive SSE → list pending.
- **Where** → Entire stack (backend + frontend)
- **Why** → Confirms MVP-ready copy-trading loop works.

**Files to Check/Create/Update**: N/A

**Step Dependencies**: Steps 1–20

**Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}

**Status:** To Do

**Prompt for verification**: "Follow the TDD's Testing Strategy cURL calls and UI clicks; confirm DB rows and SSE behavior."

**Files Modified/Created:** N/A

**Summary of Changes & Reasoning:** Validates integration and detects any gaps before layering advanced features.