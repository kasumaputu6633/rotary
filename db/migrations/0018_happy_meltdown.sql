ALTER TABLE "users" RENAME COLUMN "name" TO "full_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "display_name" TO "shop_name";--> statement-breakpoint
DROP INDEX "users_display_name_lower_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_verified_at" timestamp;--> statement-breakpoint
UPDATE "users"
SET "email_verified_at" = COALESCE("updated_at", "created_at", NOW())
WHERE "email" IS NOT NULL
  AND "is_verified" = true
  AND "email_verified_at" IS NULL;--> statement-breakpoint
UPDATE "users" AS "user"
SET "phone_verified_at" = "proof"."verified_at"
FROM (
  SELECT "contact", MAX("created_at") AS "verified_at"
  FROM "otp_codes"
  WHERE "type" = 'phone_verify'
    AND "used" = true
  GROUP BY "contact"
) AS "proof"
WHERE "user"."phone" = "proof"."contact"
  AND "user"."phone_verified_at" IS NULL;
