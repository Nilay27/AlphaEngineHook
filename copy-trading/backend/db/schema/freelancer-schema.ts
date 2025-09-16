// @ts-nocheck
// db/schema/freelancer-schema.ts
import { InferModel } from 'drizzle-orm'
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * @file freelancer-schema.ts
 * Defines a "freelancer" table for users with role='freelancer'
 */
export const freelancerTable = pgTable('freelancer', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletAddress: text('walletAddress').notNull(),
  walletEns: text('walletEns'),
  
  // The "freelancer name" or public name
  freelancerName: text('freelancerName'),

  // For storing their skillset (comma-separated or free text for MVP)
  skills: text('skills'),

  // An optional profile pic
  profilePicUrl: text('profilePicUrl'),
  
  // GitHub profile
  githubProfileUsername: text('githubProfileUsername'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type Freelancer = InferModel<typeof freelancerTable>
export type NewFreelancer = InferModel<typeof freelancerTable, 'insert'>