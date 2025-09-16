// @ts-nocheck
// @ts-nocheck
// db/schema/company-schema.ts
import { InferModel } from 'drizzle-orm'
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * @file company-schema.ts
 * Defines a "company" table for users with role='company'
 */
export const companyTable = pgTable('company', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletAddress: text('walletAddress').notNull(),
  walletEns: text('walletEns').notNull(),
  
  // The company name
  companyName: text('companyName'),
  
  // A short description of the company
  shortDescription: text('shortDescription'),
  
  // An optional company logo
  logoUrl: text('logoUrl'),
  
  // GitHub profile
  githubProfileUsername: text('githubProfileUsername'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type Company = InferModel<typeof companyTable>
export type NewCompany = InferModel<typeof companyTable, 'insert'>