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