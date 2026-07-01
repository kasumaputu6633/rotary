ALTER TYPE "public"."complaint_target_type" ADD VALUE 'waste_location';--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "target_waste_location_id" uuid;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_target_waste_location_id_waste_locations_id_fk" FOREIGN KEY ("target_waste_location_id") REFERENCES "public"."waste_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "complaints_target_waste_location_idx" ON "complaints" USING btree ("target_waste_location_id");