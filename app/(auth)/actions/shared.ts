"use server";

import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { createAccountSession, trustCurrentDevice } from "@/lib/auth-session";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { sendOtpEmail, type OtpEmailType } from "@/lib/email";
import { COOKIE } from "./constants";
import { isEmail } from "./helpers";

export async function getCookie(name: string) {
  return (await cookies()).get(name)?.value ?? null;
}

export async function setPendingContact(contact: string) {
  (await cookies()).set("pending_contact", contact, COOKIE.pending);
}

export async function getPendingContact() {
  return getCookie("pending_contact");
}

export async function clearPendingContact() {
  (await cookies()).delete("pending_contact");
}

export async function setPendingLoginUserId(userId: string) {
  (await cookies()).set("pending_login_user_id", userId, COOKIE.pending);
}

export async function getPendingLoginUserId() {
  return getCookie("pending_login_user_id");
}

export async function setPendingLoginRedirect(path: string) {
  (await cookies()).set("pending_login_redirect", path, COOKIE.pending);
}

export async function getPendingLoginRedirect() {
  return getCookie("pending_login_redirect");
}

export async function setPendingLoginReason(reason: "two_factor" | "new_device") {
  (await cookies()).set("pending_login_reason", reason, COOKIE.pending);
}

export async function getPendingLoginReason() {
  return getCookie("pending_login_reason");
}

export async function createSession(
  userId: string,
  deviceId?: string | null,
  method?: string,
) {
  return createAccountSession(userId, { deviceId, method });
}

export async function trustDevice(userId: string) {
  return trustCurrentDevice(userId);
}

export async function clearPendingLogin() {
  const store = await cookies();
  store.delete("pending_login_user_id");
  store.delete("pending_login_redirect");
  store.delete("pending_login_reason");
  store.delete("pending_contact");
}

export async function createAndSendOtp(
  contact: string,
  type: OtpEmailType,
  name?: string | null,
) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.delete(otpCodes).where(and(eq(otpCodes.contact, contact), eq(otpCodes.type, type)));
  await db.insert(otpCodes).values({ contact, code, type, expiresAt });

  if (isEmail(contact)) {
    await sendOtpEmail(contact, code, type, name);
    return;
  }

  throw new Error("Pengiriman OTP WhatsApp belum tersedia.");
}

export async function verifyOtp(contact: string, code: string, type: OtpEmailType) {
  const otp = await db.query.otpCodes.findFirst({
    where: and(
      eq(otpCodes.contact, contact),
      eq(otpCodes.code, code),
      eq(otpCodes.type, type),
      eq(otpCodes.used, false),
      gt(otpCodes.expiresAt, new Date()),
    ),
  });
  if (!otp) return false;
  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
  return true;
}
