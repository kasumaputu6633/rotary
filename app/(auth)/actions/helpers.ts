import { users } from "@/db/schema";
import { isEmailContact, normalizeAuthContact } from "@/lib/auth-contact";
import { eq, sql } from "drizzle-orm";

export function isEmail(contact: string) {
  return isEmailContact(contact);
}

export function userWhereClause(contact: string) {
  const normalized = normalizeAuthContact(contact);
  if (!normalized) return sql`false`;
  return isEmail(normalized) ? eq(users.email, normalized) : eq(users.phone, normalized);
}

export function getSafeLoginRedirect(value: string | null | undefined, role: "user" | "admin") {
  if (role === "admin") return "/admin/dashboard";
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  if (
    value.startsWith("/admin")
    || value.startsWith("/login")
    || value.startsWith("/register")
    || value.startsWith("/forgot-password")
  ) {
    return "/";
  }
  return value;
}
