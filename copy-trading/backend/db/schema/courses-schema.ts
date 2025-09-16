// @ts-nocheck
/**
 * @file courses-schema.ts
 *
 * @description
 * Defines the "courses" table for platform-owned courses in the MVP.
 * Each course can have a fee that is deducted from the user's off-chain balance upon enrollment.
 *
 * Key features:
 * - "course_name" to describe the course title.
 * - "course_fee" numeric field for off-chain payment simulation.
 *
 * @dependencies
 * - drizzle-orm/pg-core for table/column creation
 * - drizzle-orm for typed model inference
 *
 * @notes
 * - This table can be extended with more fields in future phases (e.g., start date, module content).
 */

import { InferModel } from 'drizzle-orm'
import { pgTable, text, numeric, uuid } from 'drizzle-orm/pg-core'

export const coursesTable = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),

  // The name or title of the course
  courseName: text('course_name').notNull(),

  // Brief or detailed description of the course
  courseDescription: text('course_description'),

  // Enrollment fee for the course (off-chain tokens)
  courseFee: numeric('course_fee', { precision: 10, scale: 2 }).default('0'),
})

/**
 * @description
 * Course type for selects
 */
export type Course = InferModel<typeof coursesTable>

/**
 * @description
 * NewCourse type for inserts
 */
export type NewCourse = InferModel<typeof coursesTable, 'insert'>
