// @ts-nocheck
/**
 * @file skills-schema.ts
 *
 * @description
 * Defines the "skills" table, which holds skill entries recognized in LearnLedger.
 *
 * Key features:
 * - Each skill is identified by a UUID primary key.
 * - "skill_name" (e.g., "React", "Solidity") and optional "skill_description".
 *
 * @dependencies
 * - drizzle-orm/pg-core for column/table definitions
 * - drizzle-orm for typed model inference
 *
 * @notes
 * - In future phases, we might expand skill definitions or integrate them with
 *   third-party APIs or advanced skill ontologies.
 */

import { InferModel } from 'drizzle-orm'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const skillsTable = pgTable('skills', {
  skillId: uuid('id').defaultRandom().primaryKey(),

  // The name of the skill (e.g. "React", "Solidity", "UI/UX")
  skillName: text('skill_name').notNull(),

  // Optional description or metadata about the skill
  skillDescription: text('skill_description'),
})

/**
 * @description
 * Skill type for selects
 */
export type Skill = InferModel<typeof skillsTable>

/**
 * @description
 * NewSkill type for inserts
 */
export type NewSkill = InferModel<typeof skillsTable, 'insert'>
