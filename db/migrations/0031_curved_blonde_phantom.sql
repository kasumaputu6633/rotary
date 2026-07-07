CREATE TABLE "recent_waste_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_waste_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recent_waste_locations" ADD CONSTRAINT "recent_waste_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_waste_locations" ADD CONSTRAINT "recent_waste_locations_location_id_waste_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."waste_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_waste_locations" ADD CONSTRAINT "saved_waste_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_waste_locations" ADD CONSTRAINT "saved_waste_locations_location_id_waste_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."waste_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recent_waste_locations_user_id_idx" ON "recent_waste_locations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recent_waste_locations_user_location_unique" ON "recent_waste_locations" USING btree ("user_id","location_id");--> statement-breakpoint
CREATE INDEX "saved_waste_locations_user_id_idx" ON "saved_waste_locations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_waste_locations_location_id_idx" ON "saved_waste_locations" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_waste_locations_user_location_unique" ON "saved_waste_locations" USING btree ("user_id","location_id");