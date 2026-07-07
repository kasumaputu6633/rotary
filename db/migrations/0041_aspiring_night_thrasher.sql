ALTER TYPE "public"."notification_type" ADD VALUE 'security_new_device';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'security_password_changed';--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"favorites" boolean DEFAULT true NOT NULL,
	"listing_activity" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;