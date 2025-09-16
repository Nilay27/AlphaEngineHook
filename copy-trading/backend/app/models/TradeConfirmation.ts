import { db } from '@/db/db'
import { tradeConfirmations, type TradeConfirmation, type NewTradeConfirmation } from '@/db/schema/trade-confirmations-schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'

export class TradeConfirmationModel {
  // Create a new trade confirmation
  static async create(data: NewTradeConfirmation): Promise<TradeConfirmation> {
    const [confirmation] = await db.insert(tradeConfirmations).values(data).returning()
    return confirmation
  }

  // Get trade confirmations by strategy
  static async findByStrategy(strategyId: number, limit = 100): Promise<TradeConfirmation[]> {
    return await db
      .select()
      .from(tradeConfirmations)
      .where(eq(tradeConfirmations.strategyId, strategyId))
      .orderBy(desc(tradeConfirmations.timestamp))
      .limit(limit)
  }

  // Get trade confirmation by hash
  static async findByHash(tradeHash: string): Promise<TradeConfirmation | null> {
    const [confirmation] = await db
      .select()
      .from(tradeConfirmations)
      .where(eq(tradeConfirmations.tradeHash, tradeHash))
      .limit(1)

    return confirmation || null
  }

  // Get pending broadcasts
  static async findPendingBroadcasts(): Promise<TradeConfirmation[]> {
    return await db
      .select()
      .from(tradeConfirmations)
      .where(eq(tradeConfirmations.broadcastStatus, 'pending'))
      .orderBy(tradeConfirmations.timestamp)
  }

  // Get trades within a time range
  static async findByTimeRange(
    strategyId: number,
    startTime: Date,
    endTime: Date
  ): Promise<TradeConfirmation[]> {
    return await db
      .select()
      .from(tradeConfirmations)
      .where(
        and(
          eq(tradeConfirmations.strategyId, strategyId),
          gte(tradeConfirmations.timestamp, startTime),
          lte(tradeConfirmations.timestamp, endTime)
        )
      )
      .orderBy(desc(tradeConfirmations.timestamp))
  }

  // Update trade confirmation
  static async update(
    id: number,
    data: Partial<NewTradeConfirmation>
  ): Promise<TradeConfirmation | null> {
    const [confirmation] = await db
      .update(tradeConfirmations)
      .set(data)
      .where(eq(tradeConfirmations.id, id))
      .returning()

    return confirmation || null
  }

  // Update broadcast status
  static async updateBroadcastStatus(
    tradeHash: string,
    status: string,
    subscriberConfirmations?: any
  ): Promise<boolean> {
    const updateData: any = { broadcastStatus: status }
    if (subscriberConfirmations) {
      updateData.subscriberConfirmations = subscriberConfirmations
    }

    const [result] = await db
      .update(tradeConfirmations)
      .set(updateData)
      .where(eq(tradeConfirmations.tradeHash, tradeHash))
      .returning()

    return !!result
  }

  // Get trade statistics for a strategy
  static async getStrategyStats(strategyId: number): Promise<any> {
    const trades = await this.findByStrategy(strategyId, 1000)

    const stats = {
      totalTrades: trades.length,
      successfulTrades: trades.filter(t => t.broadcastStatus === 'completed').length,
      pendingTrades: trades.filter(t => t.broadcastStatus === 'pending').length,
      failedTrades: trades.filter(t => t.broadcastStatus === 'failed').length,
      tradingPairs: [...new Set(trades.map(t => t.tokenPair).filter(Boolean))],
    }

    return stats
  }
}