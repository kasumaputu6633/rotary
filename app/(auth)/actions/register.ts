"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import {
  ActionResult,
  DB_ERROR,
} from "./constants";
import {
  getPendingContact,
  setPendingContact,
  clearPendingContact,
  createSession,
  trustDevice,
  createAndSendOtp,
  verifyOtp,
} from "./shared";
import { canBypassOtp } from "./otp-bypass";
import { userWhereClause, isEmail } from "./helpers";
import { createDefaultShopName } from "@/lib/profile";
import { isContactVerified } from "@/lib/account-verification";
import { normalizeAuthContact } from "@/lib/auth-contact";
import { otpErrorMessage } from "@/lib/otp";
import { passwordValid } from "@/lib/password";
import { validateSafeText } from "@/lib/sanitize";

function verifiedContactUpdate(contact: string, verifiedAt: Date) {
  return {
    isVerified: true,
    updatedAt: verifiedAt,
    ...(isEmail(contact)
      ? { emailVerifiedAt: verifiedAt }
      : { phoneVerifiedAt: verifiedAt }),
  };
}

export async function registerAction(contact: string): Promise<ActionResult> {
  const normalizedContact = normalizeAuthContact(contact);
  if (!normalizedContact) {
    return { error: "Masukkan email atau nomor HP Indonesia yang valid." };
  }

  try {
    const existing = await db.query.users.findFirst({ where: userWhereClause(normalizedContact) });

    if (existing && isContactVerified(existing, normalizedContact)) {
      return { error: "Akun dengan kontak ini sudah terdaftar." };
    }

    if (!existing) {
      await db.insert(users).values({
        email: isEmail(normalizedContact) ? normalizedContact : null,
        phone: !isEmail(normalizedContact) ? normalizedContact : null,
      });
    }

    await setPendingContact(normalizedContact);
    if (canBypassOtp(normalizedContact)) {
      const verifiedAt = new Date();
      await db
        .update(users)
        .set(verifiedContactUpdate(normalizedContact, verifiedAt))
        .where(userWhereClause(normalizedContact));
      return { redirectTo: "/register/profile" };
    }

    await createAndSendOtp(normalizedContact, "register");
    return { redirectTo: "/register/verify" };
  } catch (error) {
    return { error: otpErrorMessage(error) || DB_ERROR };
  }
}

export async function verifyRegisterOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const result = canBypassOtp(contact)
      ? { ok: true as const }
      : await verifyOtp(contact, code, "register");
    if (!result.ok) {
      return {
        error: result.reason === "attempts"
          ? "Terlalu banyak percobaan. Minta kode baru."
          : "Kode salah atau sudah kedaluwarsa.",
      };
    }
    const verifiedAt = new Date();
    await db.update(users).set(verifiedContactUpdate(contact, verifiedAt)).where(userWhereClause(contact));
    return { redirectTo: "/register/profile" };
  } catch (error) {
    return { error: otpErrorMessage(error) || DB_ERROR };
  }
}

export async function resendRegisterOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };
  try {
    if (canBypassOtp(contact)) return {};
    await createAndSendOtp(contact, "register");
  } catch (error) {
    return { error: otpErrorMessage(error) || DB_ERROR };
  }
}

export async function updateProfileAction(
  fullName: string,
  shopName: string,
  password: string,
): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };
  if (fullName.trim().length < 2) return { error: "Nama lengkap minimal 2 karakter." };
  const nameErr = validateSafeText(fullName.trim(), "Nama lengkap", { minLen: 2, maxLen: 80 });
  if (nameErr) return { error: nameErr };
  if (password.length > 128 || !passwordValid(password)) {
    return { error: "Kata sandi belum memenuhi semua persyaratan." };
  }

  const trimmedShopName = shopName.trim().slice(0, 80);
  if (trimmedShopName.length < 2) return { error: "Nama lapak minimal 2 karakter." };
  const shopErr = validateSafeText(trimmedShopName, "Nama lapak", { minLen: 2, maxLen: 80 });
  if (shopErr) return { error: shopErr };

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .update(users)
      .set({
        fullName,
        shopName: trimmedShopName || createDefaultShopName(fullName),
        passwordHash,
        updatedAt: new Date(),
      })
      .where(userWhereClause(contact))
      .returning({ id: users.id });
    if (!user) return { error: "Akun pendaftaran tidak ditemukan. Silakan mulai ulang." };

    await clearPendingContact();
    const device = await trustDevice(user.id);
    await createSession(user.id, device.id, "register");
    return { redirectTo: "/" };
  } catch {
    return { error: DB_ERROR };
  }
}
