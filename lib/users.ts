import { db } from "@/db";
import { users } from "@/db/schema";
import { and, ne, sql } from "drizzle-orm";

// Cek apakah display_name udah dipakai user lain (case-insensitive).
// excludeUserId dipakai pas update profil sendiri biar gak match diri sendiri.
export async function isDisplayNameTaken(displayName: string, excludeUserId?: string) {
  const lowered = displayName.trim().toLowerCase();
  if (!lowered) return false;

  const existing = await db.query.users.findFirst({
    where: excludeUserId
      ? and(sql`LOWER(${users.displayName}) = ${lowered}`, ne(users.id, excludeUserId))
      : sql`LOWER(${users.displayName}) = ${lowered}`,
    columns: { id: true },
  });

  return Boolean(existing);
}
