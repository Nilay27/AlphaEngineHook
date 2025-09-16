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