CREATE TABLE "strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"performance_metrics" jsonb,
	"subscriber_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer,
	"subscriber_wallet" varchar(255) NOT NULL,
	"subscription_amount" numeric(18, 8),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_strategy_id_subscriber_wallet_unique" UNIQUE("strategy_id","subscriber_wallet")
);
--> statement-breakpoint
CREATE TABLE "trade_confirmations" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer,
	"trade_hash" varchar(255) NOT NULL,
	"trade_type" varchar(50),
	"token_pair" varchar(100),
	"amount" numeric(18, 8),
	"price" numeric(18, 8),
	"timestamp" timestamp DEFAULT now(),
	"subscriber_confirmations" jsonb,
	"broadcast_status" varchar(50) DEFAULT 'pending',
	CONSTRAINT "trade_confirmations_trade_hash_unique" UNIQUE("trade_hash")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "on_chain_project_id" text;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "on_chain_submission_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_confirmations" ADD CONSTRAINT "trade_confirmations_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;