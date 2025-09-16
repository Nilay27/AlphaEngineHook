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

// Export with both names for compatibility
export const strategies = strategiesTable;

export type Strategy = typeof strategiesTable.$inferSelect;
export type NewStrategy = typeof strategiesTable.$inferInsert;