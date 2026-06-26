ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "conversations" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "messages" FROM anon, authenticated;
