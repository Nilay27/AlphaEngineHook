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
 * - AlphaEngine core schemas only (copy-trading platform)
 */

export * from './user-balances-schema'
export * from './placeholder'
export * from './strategies-schema'
export * from './subscriptions-schema'
export * from './trade-confirmations-schema'
export * from './address-mappings-schema'
export * from './alpha-generators-schema'
export * from './protocols-schema'
