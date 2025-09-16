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