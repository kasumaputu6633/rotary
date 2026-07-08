"use server";

import { db } from "@/db";
import { userRecoveryCodes, users } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  ActionResult,
  DB_ERROR,
} from "./constants";
import {
  setPendingContact,
  setPendingLoginUserId,
  setPendingLoginRedirect,
  getPendingContact,
  getPendingLoginUserId,
  getPendingLoginRedirect,
  getPendingLoginReason,
  createSession,
  trustDevice,
  clearPendingLogin,
  createAndSendOtp,
  verifyOtp,
  setPendingLoginReason,
} from "./shared";
import { getSafeLoginRedirect, isEmail, userWhereClause } from "./helpers";
import { canBypassOtp } from "./otp-bypass";
import { isContactVerified } from "@/lib/account-verification";
import {
  getTrustedDevice,
  hashRecoveryCode,
  recordLoginActivity,
} from "@/lib/auth-session";
import { normalizeAuthContact } from "@/lib/auth-contact";
import { otpErrorMessage } from "@/lib/otp";

export async function loginAction(
  contact: string,
  password: string,
  requestedRedirect?: string | null,
): Promise<ActionResult> {
  const normalizedContact = normalizeAuthContact(contact);
  if (!normalizedContact) {
    return { error: "Email/nomor telepon atau kata sandi salah." };
  }

  try {
    const user = await db.query.users.findFirst({ where: userWhereClause(normalizedContact) });

    if (!user || !user.passwordHash || !isContactVerified(user, normalizedContact)) {
      return { error: "Email/nomor telepon atau kata sandi salah." };
    }

    if (user.isBanned) {
      return { error: "Akun Anda telah dinonaktifkan karena melanggar kebijakan platform." };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await recordLoginActivity(user.id, "login_failed", {
        method: isEmail(normalizedContact) ? "email_password" : "phone_password",
        status: "failed",
      });
      return { error: "Email/nomor telepon atau kata sandi salah." };
    }
    const userRole = user.role ?? "user";
    const redirectPath = getSafeLoginRedirect(requestedRedirect, userRole);
    const loginMethod = isEmail(normalizedContact) ? "email_password" : "phone_password";

    if (canBypassOtp(normalizedContact)) {
      await clearPendingLogin();
      const device = await trustDevice(user.id);
      await createSession(user.id, device.id, loginMethod);
      return { redirectTo: redirectPath };
    }

    const trustedDevice = await getTrustedDevice(user.id);

    if (trustedDevice && !user.twoFactorEnabled) {
      await clearPendingLogin();
      await createSession(user.id, trustedDevice.id, loginMethod);
      return { redirectTo: redirectPath };
    }

    const otpContact = user.twoFactorEnabled
      ? user.twoFactorMethod === "whatsapp"
        ? user.phone && user.phoneVerifiedAt ? user.phone : null
        : user.email && user.emailVerifiedAt ? user.email : null
      : normalizedContact;
    if (!otpContact) {
      return {
        error: "Kontak verifikasi untuk login tidak tersedia. Perbarui keamanan akun.",
      };
    }

    await createAndSendOtp(otpContact, "login_verify", user.fullName);
    await setPendingContact(otpContact);
    await setPendingLoginUserId(user.id);
    await setPendingLoginRedirect(redirectPath);
    await setPendingLoginReason(user.twoFactorEnabled ? "two_factor" : "new_device");
    await recordLoginActivity(user.id, "login_challenge", {
      method: user.twoFactorEnabled
        ? `two_factor_${isEmail(otpContact) ? "email" : "whatsapp"}`
        : `new_device_${isEmail(otpContact) ? "email" : "whatsapp"}`,
      status: "info",
    });
    return { redirectTo: "/login/verify" };
  } catch (error) {
    return { error: otpErrorMessage(error) || DB_ERROR };
  }
}

export async function verifyLoginOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  const userId = await getPendingLoginUserId();
  const requestedRedirect = await getPendingLoginRedirect();
  const reason = await getPendingLoginReason();
  if (!contact || !userId) return { error: "Sesi habis, silakan masuk kembali." };

  try {
    const result = canBypassOtp(contact)
      ? { ok: true as const }
      : await verifyOtp(contact, code, "login_verify");
    if (!result.ok) {
      return {
        error: result.reason === "attempts"
          ? "Terlalu banyak percobaan. Minta kode baru."
          : "Kode salah atau sudah kedaluwarsa.",
      };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    const redirectPath = getSafeLoginRedirect(requestedRedirect, user?.role ?? "user");
    await clearPendingLogin();
    const device = await trustDevice(userId);
    await createSession(
      userId,
      device.id,
      reason === "two_factor"
        ? `two_factor_${isEmail(contact) ? "email" : "whatsapp"}`
        : `new_device_${isEmail(contact) ? "email" : "whatsapp"}`,
    );
    return { redirectTo: redirectPath };
  } catch (error) {
    return { error: otpErrorMessage(error) || DB_ERROR };
  }
}

export async function verifyLoginRecoveryCodeAction(code: string): Promise<ActionResult> {
  const userId = await getPendingLoginUserId();
  const requestedRedirect = await getPendingLoginRedirect();
  const reason = await getPendingLoginReason();
  if (!userId || reason !== "two_factor") {
    return { error: "Recovery code hanya dapat dipakai saat verifikasi dua langkah." };
  }

  try {
    const normalizedCode = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(normalizedCode)) {
      return { error: "Format recovery code tidak valid." };
    }

    const recoveryCode = await db.query.userRecoveryCodes.findFirst({
      where: and(
        eq(userRecoveryCodes.userId, userId),
        eq(userRecoveryCodes.codeHash, hashRecoveryCode(normalizedCode)),
        isNull(userRecoveryCodes.usedAt),
      ),
    });
    if (!recoveryCode) {
      return { error: "Recovery code tidak valid atau sudah pernah digunakan." };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    await db
      .update(userRecoveryCodes)
      .set({ usedAt: new Date() })
      .where(eq(userRecoveryCodes.id, recoveryCode.id));

    const redirectPath = getSafeLoginRedirect(requestedRedirect, user?.role ?? "user");
    await clearPendingLogin();
    const device = await trustDevice(userId);
    await createSession(userId, device.id, "two_factor_recovery");
    return { redirectTo: redirectPath };
  } catch (error) {
    return { error: otpErrorMessage(error) || DB_ERROR };
  }
}

export async function resendLoginOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  const userId = await getPendingLoginUserId();
  if (!contact || !userId) return { error: "Sesi habis, silakan masuk kembali." };

  try {
    if (canBypassOtp(contact)) return {};
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { fullName: true },
    });
    await createAndSendOtp(contact, "login_verify", user?.fullName);
  } catch {
    return { error: DB_ERROR };
  }
}
