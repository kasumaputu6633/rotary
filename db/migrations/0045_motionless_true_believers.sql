DROP INDEX "conversations_pair_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_role_pair_unique" ON "conversations" USING btree ("buyer_id","seller_id");