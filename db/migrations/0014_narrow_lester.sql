ALTER TABLE "users" ADD COLUMN "display_name" varchar(80);--> statement-breakpoint
UPDATE "users"
SET "display_name" = LEFT(SPLIT_PART(TRIM("name"), ' ', 1), 80)
WHERE "display_name" IS NULL
	AND "name" IS NOT NULL
	AND TRIM("name") <> '';
