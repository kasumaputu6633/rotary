ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "whatsapp_contact_enabled" boolean DEFAULT false NOT NULL;
