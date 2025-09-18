CREATE TABLE "address_mappings" (
	"mapping_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"real_address" varchar(42) NOT NULL,
	"encrypted_address" text NOT NULL,
	"encrypted_data" text NOT NULL,
	"alpha_generator_address" varchar(42) NOT NULL,
	"subscription_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "address_mappings_encrypted_address_unique" UNIQUE("encrypted_address")
);
--> statement-breakpoint
CREATE TABLE "alpha_generators" (
	"generator_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generator_address" varchar(42) NOT NULL,
	"name" varchar(100),
	"description" text,
	"performance_stats" jsonb DEFAULT '{"totalTrades":0,"successRate":0,"avgReturns":0,"totalVolume":0}'::jsonb,
	"encryption_support" boolean DEFAULT true,
	"fee_percentage" numeric(5, 2) DEFAULT '1.00',
	"min_subscription_amount" numeric(20, 18),
	"max_subscribers" numeric(10, 0),
	"current_subscribers" numeric(10, 0) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_generators_generator_address_unique" UNIQUE("generator_address")
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"strategy_id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_name" varchar(255),
	"strategy_description" text,
	"subscription_fee" varchar,
	"supported_protocols" jsonb,
	"strategy_json" jsonb,
	"alpha_generator_address" text,
	"subscriber_count" integer DEFAULT 0 NOT NULL,
	"total_volume" numeric(78, 0) DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"subscription_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alpha_generator_address" varchar(42),
	"alpha_consumer_address" varchar(42) NOT NULL,
	"encrypted_consumer_address" text,
	"subscription_type" varchar(20) DEFAULT 'generator',
	"encryption_version" integer DEFAULT 1,
	"subscription_tx_hash" varchar(66),
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_confirmations" (
	"confirmation_id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" text NOT NULL,
	"alpha_consumer_address" text NOT NULL,
	"execution_params" jsonb,
	"gas_estimate" text,
	"is_executed" boolean DEFAULT false NOT NULL,
	"execution_tx_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_ens" text NOT NULL,
	"wallet_address" text NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "protocols" (
	"protocol_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"contract_address" varchar(42),
	"chain_id" varchar(10) NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{"logo":null,"website":null,"docs":null,"fees":{},"limits":{}}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "protocols_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "idx_address_mappings_real" ON "address_mappings" USING btree ("real_address");--> statement-breakpoint
CREATE INDEX "idx_address_mappings_encrypted" ON "address_mappings" USING btree ("encrypted_address");--> statement-breakpoint
CREATE INDEX "idx_address_mappings_generator" ON "address_mappings" USING btree ("alpha_generator_address");--> statement-breakpoint
CREATE INDEX "idx_address_mappings_subscription" ON "address_mappings" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_address_mapping_lookup" ON "address_mappings" USING btree ("real_address","alpha_generator_address");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_subscription_mapping" ON "address_mappings" USING btree ("real_address","alpha_generator_address");--> statement-breakpoint
CREATE INDEX "idx_generators_address" ON "alpha_generators" USING btree ("generator_address");--> statement-breakpoint
CREATE INDEX "idx_generators_active" ON "alpha_generators" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_generators_performance" ON "alpha_generators" USING btree ("performance_stats");--> statement-breakpoint
CREATE INDEX "idx_protocols_name" ON "protocols" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_protocols_active" ON "protocols" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_protocols_chain" ON "protocols" USING btree ("chain_id");