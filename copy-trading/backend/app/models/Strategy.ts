import { db } from '@/db/db'
import { strategies, type Strategy, type NewStrategy } from '@/db/schema/strategies-schema'
import { eq, and, desc } from 'drizzle-orm'

export class StrategyModel {
  // Create a new strategy
  static async create(data: NewStrategy): Promise<Strategy> {
    const [strategy] = await db.insert(strategies).values(data).returning()
    return strategy
  }

  // Get all strategies
  static async findAll(isActive?: boolean): Promise<Strategy[]> {
    const conditions = []
    if (isActive !== undefined) {
      conditions.push(eq(strategies.isActive, isActive))
    }

    return await db
      .select()
      .from(strategies)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(strategies.createdAt))
  }

  // Get strategy by ID
  static async findById(id: string): Promise<Strategy | null> {
    const [strategy] = await db
      .select()
      .from(strategies)
      .where(eq(strategies.strategyId, id))
      .limit(1)

    return strategy || null
  }

  // Get strategies by wallet address
  static async findByWallet(walletAddress: string): Promise<Strategy[]> {
    return await db
      .select()
      .from(strategies)
      .where(eq(strategies.alphaGeneratorAddress, walletAddress))
      .orderBy(desc(strategies.createdAt))
  }

  // Update strategy
  static async update(id: string, data: Partial<NewStrategy>): Promise<Strategy | null> {
    const [strategy] = await db
      .update(strategies)
      .set(data)
      .where(eq(strategies.strategyId, id))
      .returning()

    return strategy || null
  }

  // Delete strategy (soft delete by setting isActive to false)
  static async softDelete(id: string): Promise<boolean> {
    const [result] = await db
      .update(strategies)
      .set({ isActive: false })
      .where(eq(strategies.strategyId, id))
      .returning()

    return !!result
  }
}