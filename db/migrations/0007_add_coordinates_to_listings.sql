ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "latitude" double precision;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "longitude" double precision;
