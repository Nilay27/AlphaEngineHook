// @ts-nocheck
/**
 * @file projects-schema.ts
 *
 * @description
 * Defines the "projects" table schema for LearnLedger. Each project can have:
 * - requiredSkills: A comma-separated list of skills that students must have to submit a PR
 * - completionSkills: A comma-separated list of skills that students gain upon completing this project
 *
 * Key columns:
 * - projectName
 * - prizeAmount (off-chain token reward)
 * - projectOwner (the company's wallet address)
 * - requiredSkills
 * - completionSkills
 * - projectRepo (GitHub or repo link)
 * - projectStatus (default "open")
 * - deadline (optional completion date)
 * - onChainProjectId (blockchain project ID returned from smart contract)
 *
 * @dependencies
 * - drizzle-orm/pg-core for columns
 * - drizzle-orm for typed model inferences
 *
 * @notes
 * Make sure you have run a migration or ALTER statement to add "completion_skills" and "required_skills" columns if you didn't have them before.
 */

import { pgTable, text, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Projects Table
 * Renamed `id` to `projectId`.
 */
export const projectsTable = pgTable("projects", {
  projectId: text("project_id").primaryKey().default(sql`gen_random_uuid()`),
  projectName: varchar("project_name", { length: 255 }),
  projectDescription: text("project_description"),
  prizeAmount: varchar("prize_amount"), // stored as string
  projectStatus: varchar("project_status", { length: 50 }),
  projectOwnerWalletEns: text("project_owner_wallet_ens"),
  projectOwnerWalletAddress: text("project_owner_wallet_address"),
  requiredSkills: text("required_skills"),
  completionSkills: text("completion_skills"),
  projectRepo: text("project_repo"),
  assignedFreelancerWalletEns: text("assigned_freelancer_wallet_ens"),
  assignedFreelancerWalletAddress: text("assigned_freelancer_wallet_address"),
  onChainProjectId: text("on_chain_project_id"), // Store the blockchain project ID
  deadline: timestamp("deadline", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

// Maintain backward compatibility with existing code
export type Project = typeof projectsTable.$inferSelect
export type NewProject = typeof projectsTable.$inferInsert
