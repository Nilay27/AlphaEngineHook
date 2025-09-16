// @ts-nocheck
/**
 * @file index.ts
 *
 * @description
 * Conveniently re-exports all table and type definitions in the "db/schema" folder.
 *
 * Key features:
 * - Allows importing from "@/db/schema" to access any schema.
 * - Gathers all table exports in one place.
 *
 * @notes
 * - We add the newly created "project-submissions-schema" below.
 */

export * from './projects-schema'
export * from './user-balances-schema'
export * from './skills-schema'
export * from './user-skills-schema'
export * from './courses-schema'
export * from './enrollments-schema'

// Added newly created project_submissions table:
export * from './project-submissions-schema'
export * from './placeholder'
export * from './freelancer-schema'
export * from './company-schema'
export * from './strategies-schema'
export * from './subscriptions-schema'
export * from './trade-confirmations-schema'
