"use server";

import { db } from "@/db";
import {
  accountSessions,
  passwordResetTokens,
  userDevices,
  users,
} from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendPasswordResetEmail } from "@/lib/email";
import { ActionResult, DB_ERROR } from "./constants";
import { userWhereClause } from "./helpers";
import { passwordValid } from "@/lib/password";
import { recordLoginActivity } from "@/lib/auth-session";
import { normalizeAuthContact, isEmailContact } from "@/lib/auth-contact";
import { otpErrorMessage } from "@/lib/otp";
import {
  clearPendingPasswordReset,
  createAndSendOtp,
  getPendingPasswordResetContact,
  getPendingPasswordResetUserId,
  setPendingPasswordReset,
  verifyOtp,
} from "./shared";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function forgotPasswordAction(contact: string): Promise<ActionResult> {
  const normalizedContact = normalizeAuthContact(contact);
  if (!normalizedContact) {
    return { error: "Masukkan email atau nomor HP Indonesia yang valid." };
  }

  try {
    const user = await db.query.users.findFirst({
      where: userWhereClause(normalizedContact),
    });

    if (isEmailContact(normalizedContact)) {
      if (user?.email && user.emailVerifiedAt) {
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

        const token = crypto.randomUUID().replace(/-/g, "");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

        const resetUrl = `${await getBaseUrl()}/forgot-password/reset?token=${token}`;
        await sendPasswordResetEmail(user.email, resetUrl, user.fullName);
      }
      return { redirectTo: "/forgot-password/sent" };
    }

    const verifiedUser = user?.phone === normalizedContact && user.phoneVerifiedAt ? user : null;
    await setPendingPasswordReset(normalizedContact, verifiedUser?.id);
    if (verifiedUser) {
      await createAndSendOtp(normalizedContact, "forgot_password", verifiedUser.fullName);
    }
    return { redirectTo: "/forgot-password/verify" };
  } catch (error) {
    // Respons sengaja tetap sama agar status keberadaan akun tidak dapat ditebak.
    if (isEmailContact(normalizedContact)) {
      return { redirectTo: "/forgot-password/sent" };
    }
    const pendingContact = await getPendingPasswordResetContact();
    if (!pendingContact) {
      await setPendingPasswordReset(normalizedContact);
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("Password reset WhatsApp delivery failed:", otpErrorMessage(error));
    }
    return { redirectTo: "/forgot-password/verify" };
  }
}

async function createPasswordResetToken(userId: string) {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  return token;
}

export async function verifyPasswordResetOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingPasswordResetContact();
  const userId = await getPendingPasswordResetUserId();
  if (!contact) return { error: "Sesi verifikasi habis. Mulai ulang pemulihan kata sandi." };
  if (!/^\d{6}$/.test(code)) return { error: "Kode verifikasi harus 6 digit." };

  try {
    if (!userId) {
      return { error: "Kode salah atau sudah kedaluwarsa." };
    }

    const result = await verifyOtp(contact, code, "forgot_password");
    if (!result.ok) {
      return {
        error: result.reason === "attempts"
          ? "Terlalu banyak percobaan. Minta kode baru."
          : "Kode salah atau sudah kedaluwarsa.",
      };
    }

    const user = await db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.phone, contact)),
      columns: { id: true },
    });
    if (!user) return { error: "Kode salah atau sudah kedaluwarsa." };

    const token = await createPasswordResetToken(user.id);
    await clearPendingPasswordReset();
    return { redirectTo: `/forgot-password/reset?token=${token}` };
  } catch {
    return { error: DB_ERROR };
  }
}

export async function resendPasswordResetOtpAction(): Promise<ActionResult> {
  const contact = await getPendingPasswordResetContact();
  const userId = await getPendingPasswordResetUserId();
  if (!contact) return { error: "Sesi verifikasi habis. Mulai ulang pemulihan kata sandi." };

  try {
    if (userId) {
      const user = await db.query.users.findFirst({
        where: and(eq(users.id, userId), eq(users.phone, contact)),
        columns: { fullName: true, phoneVerifiedAt: true },
      });
      if (user?.phoneVerifiedAt) {
        await createAndSendOtp(contact, "forgot_password", user.fullName);
      }
    }
    return { message: "Jika nomor terdaftar, kode baru telah dikirim melalui WhatsApp." };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Password reset OTP resend failed:", otpErrorMessage(error));
    }
    return { message: "Jika nomor terdaftar, kode baru telah dikirim melalui WhatsApp." };
  }
}

export async function validateResetToken(token: string) {
  const record = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.token, token),
      eq(passwordResetTokens.used, false),
      gt(passwordResetTokens.expiresAt, new Date()),
    ),
  });
  return record ?? null;
}

export async function resetPasswordAction(token: string, password: string): Promise<ActionResult> {
  try {
    if (password.length > 128 || !passwordValid(password)) {
      return { error: "Kata sandi baru belum memenuhi semua persyaratan." };
    }

    const record = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    });

    if (!record) return { error: "Link tidak valid atau sudah kedaluarsa." };

    const user = await db.query.users.findFirst({
      where: eq(users.id, record.userId),
      columns: { passwordHash: true },
    });
    if (user?.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
      return { error: "Kata sandi baru harus berbeda dari kata sandi sebelumnya." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const changedAt = new Date();
    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({ passwordHash, updatedAt: changedAt })
        .where(eq(users.id, record.userId));
      await tx.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, record.userId));
      await tx.update(accountSessions)
        .set({ revokedAt: changedAt })
        .where(and(
          eq(accountSessions.userId, record.userId),
          isNull(accountSessions.revokedAt),
        ));
      await tx.delete(userDevices).where(eq(userDevices.userId, record.userId));
    });

    await recordLoginActivity(record.userId, "password_reset", { method: "reset_token" });
    const cookieStore = await cookies();
    cookieStore.delete("rotary_session");
    cookieStore.delete("rotary_device");
    cookieStore.delete("session_user_id");
    cookieStore.delete("session_role");
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/login");
}
