CREATE TYPE "public"."waste_location_type" AS ENUM('tps', 'vendor');--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "type" "waste_location_type" DEFAULT 'tps' NOT NULL;--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "operating_hours" varchar(255);--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "rating" double precision;--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "review_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "waste_locations" ADD COLUMN "image_url" text;