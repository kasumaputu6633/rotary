CREATE TYPE "public"."complaint_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
ALTER TABLE "cases" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cases" CASCADE;--> statement-breakpoint
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_case_id_cases_id_fk";
--> statement-breakpoint
DROP INDEX "complaints_case_id_idx";--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "priority" "complaint_priority" DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "assignee_id" uuid;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "complaints_assignee_idx" ON "complaints" USING btree ("assignee_id");--> statement-breakpoint
ALTER TABLE "complaints" DROP COLUMN "case_id";--> statement-breakpoint
DROP TYPE "public"."case_priority";--> statement-breakpoint
DROP TYPE "public"."case_status";