import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { sendOtpEmail, type OtpEmailType } from "@/lib/email";
import { normalizeAuthContact } from "@/lib/auth-contact";
import { sendWhatsAppOtp, type WhatsAppOtpPurpose, WahaError } from "@/lib/waha";
import { and, count, desc, eq, gt, gte } from "drizzle-orm";

export type OtpType =
  | "register"
  | "forgot_password"
  | "login_verify"
  | "phone_verify"
  | "email_verify"
  | "two_factor";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_RATE_WINDOW_MS = 15 * 60 * 1000;
const OTP_MAX_SENDS_PER_WINDOW = 5;
const OTP_MAX_ATTEMPTS = 5;

export class OtpError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_CONTACT"
      | "COOLDOWN"
      | "RATE_LIMIT"
      | "DELIVERY_FAILED",
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "OtpError";
  }
}

function otpSecret() {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("OTP_HASH_SECRET belum dikonfigurasi dengan aman.");
  }
  return secret;
}

function hashOtp(contact: string, type: OtpType, code: string) {
  return createHmac("sha256", otpSecret())
    .update(`${contact}:${type}:${code}`)
    .digest("hex");
}

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

function isEmail(contact: string) {
  return contact.includes("@");
}

function deliveryError(error: unknown) {
  if (error instanceof WahaError) {
    if (error.code === "NUMBER_NOT_FOUND") {
      return new OtpError(error.message, "INVALID_CONTACT");
    }
    return new OtpError(
      "Kode belum dapat dikirim melalui WhatsApp. Coba beberapa saat lagi.",
      "DELIVERY_FAILED",
    );
  }
  return new OtpError("Kode verifikasi belum dapat dikirim.", "DELIVERY_FAILED");
}

export async function sendOtp({
  contact: rawContact,
  name,
  type,
}: {
  contact: string;
  name?: string | null;
  type: OtpType;
}) {
  const contact = normalizeAuthContact(rawContact);
  if (!contact) {
    throw new OtpError("Email atau nomor HP tidak valid.", "INVALID_CONTACT");
  }

  const now = new Date();
  const latest = await db.query.otpCodes.findFirst({
    where: and(eq(otpCodes.contact, contact), eq(otpCodes.type, type)),
    orderBy: [desc(otpCodes.createdAt)],
  });

  if (latest) {
    const elapsed = now.getTime() - latest.createdAt.getTime();
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new OtpError(
        `Tunggu ${retryAfterSeconds} detik sebelum meminta kode baru.`,
        "COOLDOWN",
        retryAfterSeconds,
      );
    }
  }

  const windowStart = new Date(now.getTime() - OTP_RATE_WINDOW_MS);
  const [recent] = await db
    .select({ value: count() })
    .from(otpCodes)
    .where(and(
      eq(otpCodes.contact, contact),
      eq(otpCodes.type, type),
      gte(otpCodes.createdAt, windowStart),
    ));

  if (Number(recent?.value ?? 0) >= OTP_MAX_SENDS_PER_WINDOW) {
    throw new OtpError(
      "Terlalu banyak permintaan kode. Coba lagi sekitar 15 menit.",
      "RATE_LIMIT",
      Math.ceil(OTP_RATE_WINDOW_MS / 1000),
    );
  }

  const code = generateOtp();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

  await db
    .update(otpCodes)
    .set({ used: true })
    .where(and(
      eq(otpCodes.contact, contact),
      eq(otpCodes.type, type),
      eq(otpCodes.used, false),
    ));

  const [record] = await db
    .insert(otpCodes)
    .values({
      contact,
      codeHash: hashOtp(contact, type, code),
      type,
      expiresAt,
    })
    .returning({ id: otpCodes.id });

  try {
    if (isEmail(contact)) {
      await sendOtpEmail(contact, code, type as OtpEmailType, name);
    } else {
      await sendWhatsAppOtp(contact, code, type as WhatsAppOtpPurpose, name);
    }
  } catch (error) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id));
    throw deliveryError(error);
  }

  return {
    contact,
    expiresAt,
    channel: isEmail(contact) ? "email" as const : "whatsapp" as const,
  };
}

export async function verifyOtp({
  code,
  contact: rawContact,
  type,
}: {
  code: string;
  contact: string;
  type: OtpType;
}) {
  const contact = normalizeAuthContact(rawContact);
  if (!contact || !/^\d{6}$/.test(code)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const otp = await db.query.otpCodes.findFirst({
    where: and(
      eq(otpCodes.contact, contact),
      eq(otpCodes.type, type),
      eq(otpCodes.used, false),
      gt(otpCodes.expiresAt, new Date()),
    ),
    orderBy: [desc(otpCodes.createdAt)],
  });

  if (!otp) return { ok: false as const, reason: "expired" as const };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
    return { ok: false as const, reason: "attempts" as const };
  }

  const matches = secureCompare(otp.codeHash, hashOtp(contact, type, code));
  if (!matches) {
    const attempts = otp.attempts + 1;
    await db
      .update(otpCodes)
      .set({
        attempts,
        used: attempts >= OTP_MAX_ATTEMPTS,
      })
      .where(eq(otpCodes.id, otp.id));
    return {
      ok: false as const,
      reason: attempts >= OTP_MAX_ATTEMPTS ? "attempts" as const : "invalid" as const,
    };
  }

  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
  return { ok: true as const };
}

export function otpErrorMessage(error: unknown) {
  if (error instanceof OtpError) return error.message;
  return "Tidak dapat mengirim kode verifikasi saat ini. Coba lagi.";
}

