ALTER TABLE "waste_locations" ALTER COLUMN "operating_hours" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "waste_locations" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "waste_locations" DROP COLUMN "review_count";