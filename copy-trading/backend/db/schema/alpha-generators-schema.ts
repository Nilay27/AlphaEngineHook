import { pgTable, uuid, varchar, jsonb, boolean, timestamp, numeric, text, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const alphaGeneratorsTable = pgTable("alpha_generators", {
  generatorId: uuid("generator_id").primaryKey().default(sql`gen_random_uuid()`),
  generatorAddress: varchar("generator_address", { length: 42 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  description: text("description"),
  performanceStats: jsonb("performance_stats").default({
    totalTrades: 0,
    successRate: 0,
    avgReturns: 0,
    totalVolume: 0,
  }),
  encryptionSupport: boolean("encryption_support").default(true),
  feePercentage: numeric("fee_percentage", { precision: 5, scale: 2 }).default("1.00"),
  minSubscriptionAmount: numeric("min_subscription_amount", { precision: 20, scale: 18 }),
  maxSubscribers: numeric("max_subscribers", { precision: 10, scale: 0 }),
  currentSubscribers: numeric("current_subscribers", { precision: 10, scale: 0 }).default("0"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}),
  registeredAt: timestamp("registered_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => {
  return {
    addressIdx: index("idx_generators_address").on(table.generatorAddress),
    activeIdx: index("idx_generators_active").on(table.isActive),
    performanceIdx: index("idx_generators_performance").on(table.performanceStats),
  }
});

export type AlphaGenerator = typeof alphaGeneratorsTable.$inferSelect;
export type NewAlphaGenerator = typeof alphaGeneratorsTable.$inferInsert;