ALTER TABLE "project_submissions" ADD COLUMN "freelancer_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" DROP COLUMN "student_address";