ALTER TABLE "project_submissions" ADD COLUMN "repo_owner" text;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "repo_name" text;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "pr_number" integer;