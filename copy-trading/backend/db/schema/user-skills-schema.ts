// @ts-nocheck
/**
 * @file user-skills-schema.ts
 *
 * @description
 * Defines a bridging table "user_skills" to represent which skills belong to which users.
 *
 * Key features:
 * - Each record maps a specific user_id to a skill_id (from the skills table).
 * - "added_at" tracks when the skill was awarded or recognized.
 *
 * @dependencies
 * - drizzle-orm/pg-core: For table/column creation
 * - drizzle-orm: For typed model inference
 *
 * @notes
 * - In the MVP, awarding a skill happens after a project is approved or a course is completed.
 * - userId is stored as text, skillId references the "skills" table (by ID).
 */

import { InferModel } from 'drizzle-orm'
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const userSkillsTable = pgTable('user_skills', {
  id: uuid('id').defaultRandom().primaryKey(),

  // The wallet address or unique user ID
  walletEns: text('wallet_ens').notNull(),
  walletAddress: text('wallet_address').notNull(),

  // The skill's UUID from skillsTable
  skillId: uuid('skill_id').notNull(),

  // Timestamp for when the skill was added to the user's profile
  addedAt: timestamp('added_at').defaultNow().notNull(),
})

/**
 * @description
 * UserSkill type for selects
 */
export type UserSkill = InferModel<typeof userSkillsTable>

/**
 * @description
 * NewUserSkill type for inserts
 */
export type NewUserSkill = InferModel<typeof userSkillsTable, 'insert'>
