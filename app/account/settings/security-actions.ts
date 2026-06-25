"use server";

import { randomBytes } from "node:crypto";
import { db } from "@/db";
import {
  accountSessions,
  loginActivities,
  otpCodes,
  userDevices,
  userRecoveryCodes,
  users,
} from "@/db/schema";
import {
  clearTrustedDevices,
  getCurrentAccountSession,
  hashRecoveryCode,
  recordLoginActivity,
  revokeOtherSessions,
} from "@/lib/auth-session";
import { requireRole } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { and, eq, gt, isNull, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type SecurityActionResult = {
  error?: string;
  message?: string;
  recoveryCodes?: string[];
  success?: boolean;
};

const TWO_FACTOR_OTP_EXPIRY_MS = 5 * 60 * 1000;
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRecoveryCode() {
  const bytes = randomBytes(8);
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += RECOVERY_ALPHABET[bytes[index] % RECOVERY_ALPHABET.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function createRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, generateRecoveryCode);
}

async function passwordMatches(password: string, passwordHash: string | null) {
  return Boolean(passwordHash && password && await bcrypt.compare(password, passwordHash));
}

async function replaceRecoveryCodes(userId: string) {
  const recoveryCodes = createRecoveryCodes();
  await db.transaction(async (tx) => {
    await tx.delete(userRecoveryCodes).where(eq(userRecoveryCodes.userId, userId));
    await tx.insert(userRecoveryCodes).values(
      recoveryCodes.map((code) => ({
        userId,
        codeHash: hashRecoveryCode(code),
      })),
    );
  });
  return recoveryCodes;
}

export async function requestTwoFactorSetupAction(
  password: string,
): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    if (!user.passwordHash) {
      return { error: "Buat kata sandi terlebih dahulu sebelum mengaktifkan verifikasi dua langkah." };
    }
    if (!await passwordMatches(password, user.passwordHash)) {
      return { error: "Kata sandi tidak sesuai." };
    }
    if (!user.email || !user.emailVerifiedAt) {
      return { error: "Verifikasi email terlebih dahulu untuk memakai verifikasi dua langkah." };
    }
    if (user.twoFactorEnabled) {
      return { error: "Verifikasi dua langkah sudah aktif." };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + TWO_FACTOR_OTP_EXPIRY_MS);
    await db.delete(otpCodes).where(and(
      eq(otpCodes.contact, user.email),
      eq(otpCodes.type, "two_factor"),
    ));
    await db.insert(otpCodes).values({
      contact: user.email,
      code,
      type: "two_factor",
      expiresAt,
    });
    await sendOtpEmail(user.email, code, "two_factor", user.fullName);

    return {
      success: true,
      message: "Kode aktivasi dikirim ke email terverifikasi kamu.",
    };
  } catch {
    return { error: "Tidak dapat mengirim kode aktivasi saat ini." };
  }
}

export async function confirmTwoFactorSetupAction(
  code: string,
): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    if (!user.email || !user.emailVerifiedAt) {
      return { error: "Email terverifikasi tidak tersedia." };
    }
    if (!/^\d{6}$/.test(code)) {
      return { error: "Kode aktivasi harus 6 digit." };
    }

    const otp = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.contact, user.email),
        eq(otpCodes.code, code),
        eq(otpCodes.type, "two_factor"),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    });
    if (!otp) {
      return { error: "Kode aktivasi salah atau sudah kedaluwarsa." };
    }

    const recoveryCodes = createRecoveryCodes();
    const changedAt = new Date();
    await db.transaction(async (tx) => {
      await tx.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
      await tx.update(users)
        .set({
          twoFactorEnabled: true,
          twoFactorMethod: "email",
          updatedAt: changedAt,
        })
        .where(eq(users.id, user.id));
      await tx.delete(userRecoveryCodes).where(eq(userRecoveryCodes.userId, user.id));
      await tx.insert(userRecoveryCodes).values(
        recoveryCodes.map((recoveryCode) => ({
          userId: user.id,
          codeHash: hashRecoveryCode(recoveryCode),
        })),
      );
    });

    await recordLoginActivity(user.id, "two_factor_enabled", { method: "email" });
    revalidatePath("/account/settings");

    return {
      success: true,
      message: "Verifikasi dua langkah berhasil diaktifkan.",
      recoveryCodes,
    };
  } catch {
    return { error: "Gagal mengaktifkan verifikasi dua langkah." };
  }
}

export async function disableTwoFactorAction(
  password: string,
): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    if (!user.twoFactorEnabled) {
      return { error: "Verifikasi dua langkah belum aktif." };
    }
    if (!await passwordMatches(password, user.passwordHash)) {
      return { error: "Kata sandi tidak sesuai." };
    }

    const current = await getCurrentAccountSession();
    const changedAt = new Date();
    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({ twoFactorEnabled: false, updatedAt: changedAt })
        .where(eq(users.id, user.id));
      await tx.delete(userRecoveryCodes).where(eq(userRecoveryCodes.userId, user.id));
      if (current) {
        await tx.update(accountSessions)
          .set({ revokedAt: changedAt })
          .where(and(
            eq(accountSessions.userId, user.id),
            ne(accountSessions.id, current.session.id),
            isNull(accountSessions.revokedAt),
          ));
        if (current.session.deviceId) {
          await tx.delete(userDevices).where(and(
            eq(userDevices.userId, user.id),
            ne(userDevices.id, current.session.deviceId),
          ));
        } else {
          await tx.delete(userDevices).where(eq(userDevices.userId, user.id));
        }
      }
    });

    await recordLoginActivity(user.id, "two_factor_disabled", { method: "password" });
    revalidatePath("/account/settings");
    return {
      success: true,
      message: "Verifikasi dua langkah dinonaktifkan. Sesi lain telah dikeluarkan.",
    };
  } catch {
    return { error: "Gagal menonaktifkan verifikasi dua langkah." };
  }
}

export async function regenerateRecoveryCodesAction(
  password: string,
): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    if (!user.twoFactorEnabled) {
      return { error: "Aktifkan verifikasi dua langkah terlebih dahulu." };
    }
    if (!await passwordMatches(password, user.passwordHash)) {
      return { error: "Kata sandi tidak sesuai." };
    }

    const recoveryCodes = await replaceRecoveryCodes(user.id);
    revalidatePath("/account/settings");
    return {
      success: true,
      recoveryCodes,
      message: "Recovery code baru berhasil dibuat. Kode lama tidak berlaku lagi.",
    };
  } catch {
    return { error: "Gagal membuat recovery code baru." };
  }
}

export async function revokeTrustedDeviceAction(
  deviceId: string,
): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    const current = await getCurrentAccountSession();
    if (current?.session.deviceId === deviceId) {
      return { error: "Perangkat yang sedang digunakan tidak dapat dicabut dari halaman ini." };
    }

    const device = await db.query.userDevices.findFirst({
      where: and(eq(userDevices.id, deviceId), eq(userDevices.userId, user.id)),
      columns: { id: true },
    });
    if (!device) return { error: "Perangkat tidak ditemukan." };

    await db.transaction(async (tx) => {
      await tx.update(accountSessions)
        .set({ revokedAt: new Date() })
        .where(and(
          eq(accountSessions.userId, user.id),
          eq(accountSessions.deviceId, deviceId),
          isNull(accountSessions.revokedAt),
        ));
      await tx.delete(userDevices).where(eq(userDevices.id, deviceId));
    });

    await recordLoginActivity(user.id, "device_revoked", { method: "account_settings" });
    revalidatePath("/account/settings");
    return { success: true, message: "Perangkat berhasil dikeluarkan." };
  } catch {
    return { error: "Gagal mengeluarkan perangkat." };
  }
}

export async function revokeSessionAction(
  sessionId: string,
): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    const current = await getCurrentAccountSession();
    if (current?.session.id === sessionId) {
      return { error: "Gunakan tombol keluar untuk mengakhiri sesi yang sedang digunakan." };
    }

    const [session] = await db
      .update(accountSessions)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(accountSessions.id, sessionId),
        eq(accountSessions.userId, user.id),
        isNull(accountSessions.revokedAt),
      ))
      .returning({ id: accountSessions.id });
    if (!session) return { error: "Sesi tidak ditemukan atau sudah berakhir." };

    await recordLoginActivity(user.id, "sessions_revoked", { method: "single_session" });
    revalidatePath("/account/settings");
    return { success: true, message: "Sesi berhasil diakhiri." };
  } catch {
    return { error: "Gagal mengakhiri sesi." };
  }
}

export async function revokeOtherSessionsAction(): Promise<SecurityActionResult> {
  try {
    const user = await requireRole("user");
    const current = await getCurrentAccountSession();
    if (!current) return { error: "Sesi aktif tidak ditemukan." };

    await revokeOtherSessions(user.id, current.session.id);
    await clearTrustedDevices(user.id, current.session.deviceId);
    await recordLoginActivity(user.id, "sessions_revoked", { method: "account_settings" });
    revalidatePath("/account/settings");

    return {
      success: true,
      message: "Semua sesi dan perangkat lain berhasil dikeluarkan.",
    };
  } catch {
    return { error: "Gagal mengeluarkan sesi lain." };
  }
}

export async function getAccountSecurityData() {
  const user = await requireRole("user");
  const current = await getCurrentAccountSession();
  const now = new Date();

  const [sessions, devices, activities, recoveryCodes] = await Promise.all([
    db.query.accountSessions.findMany({
      where: and(
        eq(accountSessions.userId, user.id),
        isNull(accountSessions.revokedAt),
        gt(accountSessions.expiresAt, now),
      ),
      orderBy: (table, { desc }) => [desc(table.lastActiveAt)],
    }),
    db.query.userDevices.findMany({
      where: and(eq(userDevices.userId, user.id), gt(userDevices.expiresAt, now)),
      orderBy: (table, { desc }) => [desc(table.lastUsedAt)],
    }),
    db.query.loginActivities.findMany({
      where: eq(loginActivities.userId, user.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 30,
    }),
    db.query.userRecoveryCodes.findMany({
      where: and(
        eq(userRecoveryCodes.userId, user.id),
        isNull(userRecoveryCodes.usedAt),
      ),
      columns: { id: true },
    }),
  ]);

  return {
    activities,
    currentSessionId: current?.session.id ?? null,
    devices,
    recoveryCodeCount: recoveryCodes.length,
    sessions,
  };
}
