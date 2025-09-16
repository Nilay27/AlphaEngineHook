ALTER TABLE "bookmarks" RENAME COLUMN "id" TO "bookmark_id";--> statement-breakpoint
ALTER TABLE "bookmarks" ALTER COLUMN "wallet_address" DROP NOT NULL;