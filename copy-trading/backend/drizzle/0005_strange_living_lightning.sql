ALTER TABLE "project_submissions" ALTER COLUMN "project_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "repo_owner" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "repo_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "pr_number" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "pr_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "completion_skills" text;