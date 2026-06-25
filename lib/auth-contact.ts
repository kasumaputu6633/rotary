import { normalizeIndonesianPhone } from "@/lib/phone";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  return EMAIL_REGEX.test(email) && email.length <= 255 ? email : null;
}

export function normalizeAuthContact(value: string) {
  return value.includes("@")
    ? normalizeEmail(value)
    : normalizeIndonesianPhone(value);
}

export function isEmailContact(contact: string) {
  return contact.includes("@");
}

