import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function isEmail(contact: string) {
  return contact.includes("@");
}

export function userWhereClause(contact: string) {
  return isEmail(contact) ? eq(users.email, contact) : eq(users.phone, contact);
}
