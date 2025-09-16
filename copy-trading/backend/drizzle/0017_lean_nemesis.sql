ALTER TABLE "user_skills" RENAME COLUMN "user_id" TO "wallet_ens";--> statement-breakpoint
ALTER TABLE "user_skills" ADD COLUMN "wallet_address" text NOT NULL;