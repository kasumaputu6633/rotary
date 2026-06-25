CREATE TYPE "public"."two_factor_method" AS ENUM('email', 'whatsapp');--> statement-breakpoint
CREATE TABLE "account_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"device_id" uuid,
	"user_agent" text,
	"ip_address" varchar(64),
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "login_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event" varchar(40) NOT NULL,
	"status" varchar(16) DEFAULT 'success' NOT NULL,
	"method" varchar(24),
	"device_name" varchar(120),
	"user_agent" text,
	"ip_address" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "login_activities_status_check" CHECK ("login_activities"."status" IN ('success', 'failed', 'info'))
);
--> statement-breakpoint
CREATE TABLE "user_recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_recovery_codes_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
DELETE FROM "user_devices";--> statement-breakpoint
ALTER TABLE "user_devices" RENAME COLUMN "device_token" TO "device_token_hash";--> statement-breakpoint
ALTER TABLE "user_devices" ADD COLUMN "device_name" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_devices" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "user_devices" ADD COLUMN "ip_address" varchar(64);--> statement-breakpoint
ALTER TABLE "user_devices" ADD COLUMN "last_used_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_devices" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_method" "two_factor_method" DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "account_sessions" ADD CONSTRAINT "account_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_sessions" ADD CONSTRAINT "account_sessions_device_id_user_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."user_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_activities" ADD CONSTRAINT "login_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recovery_codes" ADD CONSTRAINT "user_recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_sessions_user_id_idx" ON "account_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_sessions_active_user_idx" ON "account_sessions" USING btree ("user_id","expires_at") WHERE "account_sessions"."revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "login_activities_user_created_idx" ON "login_activities" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "user_recovery_codes_user_id_idx" ON "user_recovery_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_devices_user_expires_idx" ON "user_devices" USING btree ("user_id","expires_at");--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_device_token_hash_unique" UNIQUE("device_token_hash");--> statement-breakpoint
ALTER TABLE "account_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "login_activities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_recovery_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_devices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "account_sessions" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "login_activities" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "user_recovery_codes" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "user_devices" FROM anon, authenticated;
