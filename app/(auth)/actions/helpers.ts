import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function isEmail(contact: string) {
  return contact.includes("@");
}

export function userWhereClause(contact: string) {
  return isEmail(contact) ? eq(users.email, contact) : eq(users.phone, contact);
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
