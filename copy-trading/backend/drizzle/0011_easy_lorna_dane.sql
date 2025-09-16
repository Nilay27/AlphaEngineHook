CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_ens" text NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "prize_amount" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "prize_amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;