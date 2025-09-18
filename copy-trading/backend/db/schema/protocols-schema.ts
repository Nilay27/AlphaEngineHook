import { pgTable, uuid, varchar, jsonb, boolean, timestamp, text, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const protocolsTable = pgTable("protocols", {
  protocolId: uuid("protocol_id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  contractAddress: varchar("contract_address", { length: 42 }),
  chainId: varchar("chain_id", { length: 10 }).notNull(),
  actions: jsonb("actions").default([]),
  metadata: jsonb("metadata").default({
    logo: null,
    website: null,
    docs: null,
    fees: {},
    limits: {},
  }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => {
  return {
    nameIdx: index("idx_protocols_name").on(table.name),
    activeIdx: index("idx_protocols_active").on(table.isActive),
    chainIdx: index("idx_protocols_chain").on(table.chainId),
  }
});

export type Protocol = typeof protocolsTable.$inferSelect;
export type NewProtocol = typeof protocolsTable.$inferInsert;