DROP TABLE IF EXISTS "vendor_profiles";--> statement-breakpoint
CREATE TABLE "waste_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_usaha" varchar(255) NOT NULL,
	"nama_pic" varchar(255),
	"email_kontak" varchar(255),
	"telepon_kontak" varchar(20),
	"alamat" text,
	"jenis_sampah_diterima" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
UPDATE "users" SET "role" = 'user' WHERE "role" = 'vendor';--> statement-breakpoint
ALTER TYPE "public"."role" RENAME TO "role_old";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."role" USING "role"::text::"public"."role";--> statement-breakpoint
DROP TYPE "public"."role_old";
