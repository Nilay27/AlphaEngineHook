ALTER TABLE "user_balances" RENAME COLUMN "user_id" TO "wallet_ens";--> statement-breakpoint
ALTER TABLE "user_balances" ADD COLUMN "wallet_address" text NOT NULL;