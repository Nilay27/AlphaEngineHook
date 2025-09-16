// @ts-nocheck
/**
 * @file project-submissions-schema.ts
 *
 * @description
 * Defines the "project_submissions" table for storing freelancer PR submissions.
 * Each submission belongs to a single project, identified by `projectId`,
 * and includes the freelancer's wallet address, plus the PR link, plus a new
 * `isMerged` field to indicate whether the submission's PR has been merged.
 */

import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Project Submissions Table
 * Renamed `id` to `submissionId`.
 * Added `projectOwner` and `projectRepo`.
 */
export const projectSubmissionsTable = pgTable("project_submissions", {
  submissionId: text('submission_id').primaryKey(),
  projectId: text("project_id"), // references projectsTable.projectId
  projectOwnerWalletEns: text("project_owner_wallet_ens"),
  projectOwnerWalletAddress: text("project_owner_wallet_address"),
  projectRepo: text("project_repo"),   // new column to store the project repo

  freelancerWalletEns: text("freelancer_wallet_ens"),
  freelancerWalletAddress: text("freelancer_wallet_address"),
  prLink: text("pr_link"),
  submissionText: text("submission_text"),
  repoOwner: text("repo_owner"),
  repoName: text("repo_name"),
  prNumber: text("pr_number"),
  isMerged: boolean("is_merged").default(false),
  status: text("status").default("pending"),  // e.g. 'pending', 'awarded', 'rejected'
  blockchainTxHash: text("blockchain_tx_hash"), // Add field for storing blockchain transaction hash
  onChainSubmissionId: text("on_chain_submission_id"), // Add field for storing blockchain submission ID
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

// Maintain backward compatibility with existing code
export type ProjectSubmission = typeof projectSubmissionsTable.$inferSelect
export type NewProjectSubmission = typeof projectSubmissionsTable.$inferInsert