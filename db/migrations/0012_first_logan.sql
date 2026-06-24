CREATE TYPE "public"."deal_stage" AS ENUM('negotiating', 'agreed', 'handover_scheduled');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "listing_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"stage" "deal_stage" DEFAULT 'negotiating' NOT NULL,
	"status" "deal_status" DEFAULT 'active' NOT NULL,
	"counterparty_name" varchar(120),
	"counterparty_contact" varchar(80),
	"agreed_price" integer,
	"handover_method" varchar(80),
	"handover_location" text,
	"scheduled_at" timestamp,
	"seller_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "listing_deals" ADD CONSTRAINT "listing_deals_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_deals" ADD CONSTRAINT "listing_deals_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_deals_listing_id_idx" ON "listing_deals" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_deals_seller_status_idx" ON "listing_deals" USING btree ("seller_id","status");--> statement-breakpoint
INSERT INTO "listing_deals" (
	"listing_id",
	"seller_id",
	"stage",
	"status",
	"created_at",
	"updated_at"
)
SELECT
	"id",
	"seller_id",
	'negotiating',
	'active',
	COALESCE("reserved_at", "updated_at"),
	"updated_at"
FROM "listings"
WHERE "status" = 'reserved';--> statement-breakpoint
INSERT INTO "listing_deals" (
	"listing_id",
	"seller_id",
	"stage",
	"status",
	"created_at",
	"updated_at",
	"completed_at"
)
SELECT
	"id",
	"seller_id",
	'agreed',
	'completed',
	COALESCE("reserved_at", "published_at", "updated_at"),
	"updated_at",
	COALESCE("completed_at", "updated_at")
FROM "listings"
WHERE "status" = 'completed';
