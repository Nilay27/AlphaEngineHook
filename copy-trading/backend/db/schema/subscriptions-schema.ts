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

// Export with both names for compatibility
export const subscriptions = subscriptionsTable;

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;