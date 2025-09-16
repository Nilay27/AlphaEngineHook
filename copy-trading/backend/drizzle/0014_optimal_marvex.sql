ALTER TABLE "project_submissions" RENAME COLUMN "freelancer_address" TO "freelancer_wallet_address";--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "freelancer_wallet_ens" text;