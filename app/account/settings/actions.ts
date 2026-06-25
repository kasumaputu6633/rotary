"use server";

import { db } from "@/db";
import {
  accountSessions,
  passwordResetTokens,
  userDevices,
  users,
} from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { getCurrentAccountSession, recordLoginActivity } from "@/lib/auth-session";
import { normalizeEmail } from "@/lib/auth-contact";
import { otpErrorMessage, sendOtp, verifyOtp } from "@/lib/otp";
import { passwordValid } from "@/lib/password";
import { normalizeIndonesianPhone } from "@/lib/phone";
import { and, eq, isNull, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const OTP_TYPE = "phone_verify" as const;
const EMAIL_OTP_TYPE = "email_verify" as const;

type ActionResult = { error?: string; success?: boolean; message?: string };

export async function changeAccountPasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    if (currentPassword.length > 128 || newPassword.length > 128) {
      return { error: "Kata sandi maksimal 128 karakter." };
    }
    if (!passwordValid(newPassword)) {
      return { error: "Kata sandi baru belum memenuhi semua persyaratan." };
    }
    if (user.passwordHash && currentPassword === newPassword) {
      return { error: "Kata sandi baru harus berbeda dari kata sandi saat ini." };
    }

    if (user.passwordHash) {
      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatches) {
        return { error: "Kata sandi saat ini tidak sesuai." };
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const updatedAt = new Date();
    const current = await getCurrentAccountSession();

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt })
        .where(eq(users.id, user.id));
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      if (current) {
        await tx.update(accountSessions)
          .set({ revokedAt: updatedAt })
          .where(and(
            eq(accountSessions.userId, user.id),
            ne(accountSessions.id, current.session.id),
            isNull(accountSessions.revokedAt),
          ));
      }
      await tx.delete(userDevices).where(eq(userDevices.userId, user.id));
    });

    (await cookies()).delete("rotary_device");
    await recordLoginActivity(user.id, "password_changed", { method: "account_settings" });
    revalidatePath("/account/settings");

    return {
      success: true,
      message: user.passwordHash
        ? "Kata sandi berhasil diubah. Sesi lain dan perangkat terpercaya telah direset."
        : "Kata sandi berhasil dibuat. Sesi lain dan perangkat terpercaya telah direset.",
    };
  } catch {
    return { error: "Gagal mengubah kata sandi. Coba lagi." };
  }
}

export async function requestEmailOtpAction(rawEmail: string): Promise<ActionResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return { error: "Masukkan alamat email yang valid." };
  }

  try {
    const user = await requireRole("user");

    const taken = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, user.id)),
      columns: { id: true },
    });
    if (taken) {
      return { error: "Email ini sudah terdaftar di akun lain." };
    }

    await sendOtp({ contact: email, type: EMAIL_OTP_TYPE, name: user.fullName });

    return {
      success: true,
      message: "Kode verifikasi sudah dikirim ke email kamu.",
    };
  } catch (error) {
    return { error: otpErrorMessage(error) };
  }
}

export async function verifyEmailOtpAction(rawEmail: string, code: string): Promise<ActionResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return { error: "Alamat email tidak valid." };
  }

  try {
    const user = await requireRole("user");
    if (!/^\d{6}$/.test(code)) {
      return { error: "Kode verifikasi harus 6 digit." };
    }

    const otpResult = await verifyOtp({ contact: email, code, type: EMAIL_OTP_TYPE });
    if (!otpResult.ok) {
      return {
        error: otpResult.reason === "attempts"
          ? "Terlalu banyak percobaan. Minta kode baru."
          : "Kode salah atau sudah kedaluwarsa.",
      };
    }

    const taken = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, user.id)),
      columns: { id: true },
    });
    if (taken) {
      return { error: "Email ini sudah terdaftar di akun lain." };
    }

    await db.transaction(async (tx) => {
      const verifiedAt = new Date();
      await tx
        .update(users)
        .set({
          email,
          emailVerifiedAt: verifiedAt,
          isVerified: true,
          updatedAt: verifiedAt,
        })
        .where(eq(users.id, user.id));
    });

    revalidatePath("/account/settings");
    revalidatePath("/account", "layout");
    revalidatePath("/dashboard", "layout");

    return { success: true, message: "Email berhasil diverifikasi." };
  } catch (error) {
    return { error: otpErrorMessage(error) };
  }
}

export async function requestPhoneOtpAction(localPhone: string): Promise<ActionResult> {
  const phone = normalizeIndonesianPhone(localPhone);
  if (!phone) {
    return { error: "Masukkan nomor HP Indonesia yang valid." };
  }

  try {
    const user = await requireRole("user");

    // Cek apakah nomor ini sudah dipakai user lain
    const taken = await db.query.users.findFirst({
      where: and(eq(users.phone, phone), ne(users.id, user.id)),
      columns: { id: true },
    });
    if (taken) {
      return { error: "Nomor HP ini sudah terdaftar di akun lain." };
    }

    await sendOtp({ contact: phone, type: OTP_TYPE, name: user.fullName });

    return {
      success: true,
      message: "Kode OTP telah dikirim ke WhatsApp kamu.",
    };
  } catch (error) {
    return { error: otpErrorMessage(error) };
  }
}

export async function verifyPhoneOtpAction(localPhone: string, code: string): Promise<ActionResult> {
  const phone = normalizeIndonesianPhone(localPhone);
  if (!phone) {
    return { error: "Nomor HP tidak valid." };
  }

  try {
    const user = await requireRole("user");
    if (!/^\d{6}$/.test(code)) {
      return { error: "Kode OTP harus 6 digit." };
    }

    const otpResult = await verifyOtp({ contact: phone, code, type: OTP_TYPE });
    if (!otpResult.ok) {
      return {
        error: otpResult.reason === "attempts"
          ? "Terlalu banyak percobaan. Minta kode baru."
          : "Kode salah atau sudah kedaluwarsa.",
      };
    }

    // Cek lagi unique constraint sebelum simpen (race condition guard)
    const taken = await db.query.users.findFirst({
      where: and(eq(users.phone, phone), ne(users.id, user.id)),
      columns: { id: true },
    });
    if (taken) {
      return { error: "Nomor HP ini sudah terdaftar di akun lain." };
    }

    await db.transaction(async (tx) => {
      const verifiedAt = new Date();
      await tx
        .update(users)
        .set({
          phone,
          phoneVerifiedAt: verifiedAt,
          isVerified: true,
          updatedAt: verifiedAt,
        })
        .where(eq(users.id, user.id));
    });

    revalidatePath("/account/settings");
    revalidatePath("/account", "layout");
    revalidatePath("/dashboard", "layout");

    return { success: true, message: "Nomor HP berhasil diverifikasi." };
  } catch (error) {
    return { error: otpErrorMessage(error) };
  }
}

export async function removeAccountPhoneAction(): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    if (user.twoFactorEnabled && user.twoFactorMethod === "whatsapp") {
      return {
        error: "Ubah atau nonaktifkan verifikasi dua langkah WhatsApp sebelum menghapus nomor HP.",
      };
    }
    await db
      .update(users)
      .set({ phone: null, phoneVerifiedAt: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    revalidatePath("/account/settings");
    revalidatePath("/account", "layout");
    revalidatePath("/dashboard", "layout");
    return { success: true, message: "Nomor HP dihapus dari akun." };
  } catch {
    return { error: "Gagal menghapus nomor HP." };
  }
}
