// @ts-nocheck
/**
 * @file enrollments-schema.ts
 *
 * @description
 * Defines the "enrollments" table which stores the relationship between users and courses.
 *
 * Key features:
 * - "user_id" references the user who enrolled in the course.
 * - "course_id" references the specific course from coursesTable.
 * - "is_completed" is a boolean to indicate if the user finished the course.
 * - "enrolled_at" records the timestamp of enrollment.
 *
 * @dependencies
 * - drizzle-orm/pg-core for table/column creation
 * - drizzle-orm for typed model inference
 *
 * @notes
 * - On completion, the system can call an action to update the user's skills.
 * - The "markCourseCompleteAction" can set is_completed to true.
 */

import { InferModel } from 'drizzle-orm'
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const enrollmentsTable = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Wallet address or unique ID of the user
  userId: text('user_id').notNull(),

  // ID of the course in the coursesTable
  courseId: text('course_id').notNull(),

  // Indicates if the user finished the course
  isCompleted: boolean('is_completed').default(false),

  // When did the user enroll in the course
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
})

/**
 * @description
 * Enrollment type for selects
 */
export type Enrollment = InferModel<typeof enrollmentsTable>

/**
 * @description
 * NewEnrollment type for inserts
 */
export type NewEnrollment = InferModel<typeof enrollmentsTable, 'insert'>
