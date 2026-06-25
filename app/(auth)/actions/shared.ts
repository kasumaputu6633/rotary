"use server";

import { createAccountSession, trustCurrentDevice } from "@/lib/auth-session";
import { cookies } from "next/headers";
import { COOKIE } from "./constants";
import {
  sendOtp,
  verifyOtp as verifyStoredOtp,
  type OtpType,
} from "@/lib/otp";

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

export async function setPendingPasswordReset(contact: string, userId?: string) {
  const store = await cookies();
  store.set("pending_password_reset_contact", contact, COOKIE.pending);
  if (userId) {
    store.set("pending_password_reset_user_id", userId, COOKIE.pending);
  } else {
    store.delete("pending_password_reset_user_id");
  }
}

export async function getPendingPasswordResetContact() {
  return getCookie("pending_password_reset_contact");
}

export async function getPendingPasswordResetUserId() {
  return getCookie("pending_password_reset_user_id");
}

export async function clearPendingPasswordReset() {
  const store = await cookies();
  store.delete("pending_password_reset_contact");
  store.delete("pending_password_reset_user_id");
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
  type: OtpType,
  name?: string | null,
) {
  return sendOtp({ contact, type, name });
}

export async function verifyOtp(contact: string, code: string, type: OtpType) {
  return verifyStoredOtp({ contact, code, type });
}
