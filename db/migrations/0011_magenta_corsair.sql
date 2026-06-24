ALTER TYPE "public"."listing_status" ADD VALUE IF NOT EXISTS 'reserved' BEFORE 'inactive';--> statement-breakpoint
ALTER TYPE "public"."listing_status" ADD VALUE IF NOT EXISTS 'completed' BEFORE 'inactive';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "reserved_at" timestamp;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorite_listings_listing_id_idx" ON "favorite_listings" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listing_images_listing_id_idx" ON "listing_images" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listings_seller_id_idx" ON "listings" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_devices_user_id_idx" ON "user_devices" USING btree ("user_id");
