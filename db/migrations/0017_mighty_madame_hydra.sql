-- Backfill: copy whatsapp ke phone untuk user yang belum punya phone.
-- Normalisasi ke format +62xxxxxxxxxx. Skip kalo ada conflict (phone udah dipakai user lain) atau panjang gak masuk akal.
DO $$
DECLARE
  u RECORD;
  norm TEXT;
BEGIN
  FOR u IN
    SELECT id, whatsapp FROM users
    WHERE phone IS NULL AND COALESCE(TRIM(whatsapp), '') != ''
  LOOP
    norm := regexp_replace(u.whatsapp, '\D', '', 'g');
    IF norm LIKE '62%' THEN
      norm := '+' || norm;
    ELSIF norm LIKE '0%' THEN
      norm := '+62' || substring(norm FROM 2);
    ELSE
      norm := '+62' || norm;
    END IF;

    -- length minimal +62 + 9 digit = 12, max +62 + 13 digit = 16
    IF length(norm) BETWEEN 12 AND 16 THEN
      BEGIN
        UPDATE users SET phone = norm, updated_at = NOW() WHERE id = u.id;
      EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'skip user %: phone % udah dipakai user lain', u.id, norm;
      END;
    END IF;
  END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "whatsapp";
