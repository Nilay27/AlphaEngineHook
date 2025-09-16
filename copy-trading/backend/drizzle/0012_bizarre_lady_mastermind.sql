ALTER TABLE "projects" RENAME COLUMN "id" TO "project_id";--> statement-breakpoint
ALTER TABLE "project_submissions" RENAME COLUMN "id" TO "submission_id";--> statement-breakpoint
ALTER TABLE "company" ALTER COLUMN "walletEns" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "prize_amount" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_owner" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "deadline" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "project_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "freelancer_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "pr_link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "repo_owner" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "repo_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "pr_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "is_merged" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_submissions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "project_owner" text;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "project_repo" text;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "submission_text" text;