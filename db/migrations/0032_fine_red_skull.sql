ALTER TABLE "waste_locations" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "waste_locations" ALTER COLUMN "type" SET DATA TYPE varchar(50) USING "type"::text;--> statement-breakpoint
ALTER TABLE "waste_locations" ALTER COLUMN "type" SET DEFAULT 'tps';--> statement-breakpoint
DROP TYPE "public"."waste_location_type";
