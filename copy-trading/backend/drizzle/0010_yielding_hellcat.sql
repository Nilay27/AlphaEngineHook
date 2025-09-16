ALTER TABLE "company" RENAME COLUMN "wallet_address" TO "walletAddress";--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "company_name" TO "companyName";--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "short_description" TO "shortDescription";--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "logo_url" TO "logoUrl";--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "freelancer" RENAME COLUMN "wallet_address" TO "walletAddress";--> statement-breakpoint
ALTER TABLE "freelancer" RENAME COLUMN "freelancer_name" TO "freelancerName";--> statement-breakpoint
ALTER TABLE "freelancer" RENAME COLUMN "profile_pic_url" TO "profilePicUrl";--> statement-breakpoint
ALTER TABLE "freelancer" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "freelancer" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "walletEns" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "githubProfileUsername" text;--> statement-breakpoint
ALTER TABLE "freelancer" ADD COLUMN "walletEns" text;--> statement-breakpoint
ALTER TABLE "freelancer" ADD COLUMN "githubProfileUsername" text;--> statement-breakpoint