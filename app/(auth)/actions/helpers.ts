import { users } from "@/db/schema";
import { isEmailContact, normalizeAuthContact } from "@/lib/auth-contact";
import { hasRole, type Role } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export function isEmail(contact: string) {
  return isEmailContact(contact);
}

export function userWhereClause(contact: string) {
  const normalized = normalizeAuthContact(contact);
  if (!normalized) return sql`false`;
  return isEmail(normalized)
    ? eq(users.email, normalized)
    : eq(users.phone, normalized);
}

export function getSafeLoginRedirect(
  value: string | null | undefined,
  role: Role,
) {
  // admin & super_admin diarahkan langsung ke area admin.
  if (hasRole(role, "admin")) return "/admin/dashboard";
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return "/";
  if (
    value.startsWith("/admin") ||
    value.startsWith("/login") ||
    value.startsWith("/register") ||
    value.startsWith("/forgot-password")
  ) {
    return "/";
  }
  return value;
}
