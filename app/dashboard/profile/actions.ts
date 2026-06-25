"use server";

import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { and, eq, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Sementara fix ke Indonesia. Begitu support multi-country tinggal ubah validasi & prefix.
const PHONE_COUNTRY_PREFIX = "+62";
const OTP_TYPE = "phone_verify" as const;
const EMAIL_OTP_TYPE = "email_verify" as const;
const OTP_EXPIRY_MS = 5 * 60 * 1000;

type ActionResult = { error?: string; success?: boolean; message?: string };

function normalizeLocalPhone(rawLocal: string) {
  // Buang non-digit, hapus leading zero (08xx → 8xx)
  return rawLocal.replace(/\D/g, "").replace(/^0+/, "");
}

function isValidIndonesianPhone(localDigits: string) {
  return localDigits.length >= 9 && localDigits.length <= 13;
}

function fullPhone(localDigits: string) {
  return `${PHONE_COUNTRY_PREFIX}${localDigits}`;
}

function normalizeEmail(rawEmail: string) {
  return rawEmail.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

// TODO(waha): ganti console.log dengan call ke WaHa endpoint.
// Contoh: await fetch(`${process.env.WAHA_URL}/api/sendText`, { method: "POST", ... })
async function sendOtpViaWhatsapp(phone: string, code: string) {
  console.log(`[WhatsApp OTP] ${phone} → kode: ${code} (berlaku 5 menit)`);
}

export async function requestEmailOtpAction(rawEmail: string): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return { error: "Masukkan alamat email yang valid." };
    }

    const taken = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, user.id)),
      columns: { id: true },
    });
    if (taken) {
      return { error: "Email ini sudah terdaftar di akun lain." };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await db.delete(otpCodes).where(and(
      eq(otpCodes.contact, email),
      eq(otpCodes.type, EMAIL_OTP_TYPE),
    ));
    await db.insert(otpCodes).values({
      contact: email,
      code,
      type: EMAIL_OTP_TYPE,
      expiresAt,
    });

    await sendOtpEmail(email, code, EMAIL_OTP_TYPE, user.fullName);

    return {
      success: true,
      message: "Kode verifikasi sudah dikirim ke email kamu.",
    };
  } catch {
    return { error: "Tidak bisa mengirim kode verifikasi saat ini. Coba lagi." };
  }
}

export async function verifyEmailOtpAction(rawEmail: string, code: string): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return { error: "Alamat email tidak valid." };
    }
    if (!/^\d{6}$/.test(code)) {
      return { error: "Kode verifikasi harus 6 digit." };
    }

    const otp = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.contact, email),
        eq(otpCodes.code, code),
        eq(otpCodes.type, EMAIL_OTP_TYPE),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    });
    if (!otp) {
      return { error: "Kode salah atau sudah kedaluarsa." };
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
      await tx.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
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

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard", "layout");

    return { success: true, message: "Email berhasil diverifikasi." };
  } catch {
    return { error: "Gagal memverifikasi email. Coba lagi." };
  }
}

export async function requestPhoneOtpAction(localPhone: string): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    const normalized = normalizeLocalPhone(localPhone);

    if (!isValidIndonesianPhone(normalized)) {
      return { error: "Nomor HP harus 9–13 digit setelah +62." };
    }

    const phone = fullPhone(normalized);

    // Cek apakah nomor ini sudah dipakai user lain
    const taken = await db.query.users.findFirst({
      where: and(eq(users.phone, phone), ne(users.id, user.id)),
      columns: { id: true },
    });
    if (taken) {
      return { error: "Nomor HP ini sudah terdaftar di akun lain." };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Bersihin OTP lama buat kontak yang sama agar gak ambigu pas verify
    await db.delete(otpCodes).where(and(eq(otpCodes.contact, phone), eq(otpCodes.type, OTP_TYPE)));
    await db.insert(otpCodes).values({ contact: phone, code, type: OTP_TYPE, expiresAt });

    await sendOtpViaWhatsapp(phone, code);

    return {
      success: true,
      message: "Kode OTP dikirim ke WhatsApp. Cek log server untuk kode sementara (WaHa belum aktif).",
    };
  } catch {
    return { error: "Tidak bisa mengirim OTP saat ini. Coba lagi." };
  }
}

export async function verifyPhoneOtpAction(localPhone: string, code: string): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    const normalized = normalizeLocalPhone(localPhone);

    if (!isValidIndonesianPhone(normalized)) {
      return { error: "Nomor HP tidak valid." };
    }
    if (!/^\d{6}$/.test(code)) {
      return { error: "Kode OTP harus 6 digit." };
    }

    const phone = fullPhone(normalized);

    const otp = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.contact, phone),
        eq(otpCodes.code, code),
        eq(otpCodes.type, OTP_TYPE),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    });

    if (!otp) {
      return { error: "Kode salah atau sudah kedaluarsa." };
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
      await tx.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
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

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard", "layout");

    return { success: true, message: "Nomor HP berhasil diverifikasi." };
  } catch {
    return { error: "Gagal memverifikasi OTP. Coba lagi." };
  }
}

export async function removeAccountPhoneAction(): Promise<ActionResult> {
  try {
    const user = await requireRole("user");
    await db
      .update(users)
      .set({ phone: null, phoneVerifiedAt: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    revalidatePath("/dashboard/profile");
    return { success: true, message: "Nomor HP dihapus dari akun." };
  } catch {
    return { error: "Gagal menghapus nomor HP." };
  }
}
