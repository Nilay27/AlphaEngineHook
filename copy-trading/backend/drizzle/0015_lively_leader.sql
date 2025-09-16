ALTER TABLE "project_submissions" RENAME COLUMN "project_owner" TO "project_owner_wallet_ens";--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "project_owner_wallet_address" text;