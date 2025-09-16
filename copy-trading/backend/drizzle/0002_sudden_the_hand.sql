CREATE TABLE "project_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"student_address" text NOT NULL,
	"pr_link" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
