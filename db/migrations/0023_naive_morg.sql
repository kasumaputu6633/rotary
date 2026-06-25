DELETE FROM "otp_codes";--> statement-breakpoint
ALTER TABLE "otp_codes" RENAME COLUMN "code" TO "code_hash";--> statement-breakpoint
ALTER TABLE "otp_codes" ALTER COLUMN "code_hash" TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "otp_codes" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "otp_codes_contact_type_created_idx" ON "otp_codes" USING btree ("contact","type","created_at");--> statement-breakpoint
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_attempts_check" CHECK ("otp_codes"."attempts" >= 0 AND "otp_codes"."attempts" <= 5);--> statement-breakpoint
ALTER TABLE "otp_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "otp_codes" FROM anon, authenticated;
