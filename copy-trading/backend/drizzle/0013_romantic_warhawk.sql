ALTER TABLE "projects" RENAME COLUMN "project_owner" TO "project_owner_wallet_ens";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "assigned_freelancer" TO "assigned_freelancer_wallet_ens";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_owner_wallet_address" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "assigned_freelancer_wallet_address" text;