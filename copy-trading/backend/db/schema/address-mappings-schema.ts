import { pgTable, uuid, text, varchar, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const addressMappingsTable = pgTable("address_mappings", {
  mappingId: uuid("mapping_id").primaryKey().default(sql`gen_random_uuid()`),
  realAddress: varchar("real_address", { length: 42 }).notNull(),
  encryptedAddress: text("encrypted_address").notNull().unique(),
  encryptedData: text("encrypted_data").notNull(),
  alphaGeneratorAddress: varchar("alpha_generator_address", { length: 42 }).notNull(),
  subscriptionId: uuid("subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => {
  return {
    realAddressIdx: index("idx_address_mappings_real").on(table.realAddress),
    encryptedAddressIdx: index("idx_address_mappings_encrypted").on(table.encryptedAddress),
    generatorIdx: index("idx_address_mappings_generator").on(table.alphaGeneratorAddress),
    subscriptionIdx: index("idx_address_mappings_subscription").on(table.subscriptionId),
    lookupIdx: index("idx_address_mapping_lookup").on(table.realAddress, table.alphaGeneratorAddress),
    uniqueMapping: uniqueIndex("unique_subscription_mapping").on(table.realAddress, table.alphaGeneratorAddress),
  }
});

export type AddressMapping = typeof addressMappingsTable.$inferSelect;
export type NewAddressMapping = typeof addressMappingsTable.$inferInsert;