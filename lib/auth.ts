import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSessionUserId(): Promise<string | null> {
  return (await cookies()).get("session_user_id")?.value ?? null;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: "user" | "admin") {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect("/unauthorized");
  return user;
}
