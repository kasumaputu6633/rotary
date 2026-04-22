"use server";

import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type ActionResult = { error: string } | undefined;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isEmail(contact: string): boolean {
  return contact.includes("@");
}

function userWhereClause(contact: string) {
  return isEmail(contact) ? eq(users.email, contact) : eq(users.phone, contact);
}

function maskContact(contact: string): string {
  if (isEmail(contact)) {
    const [local, domain] = contact.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  }
  return contact.slice(0, 4) + "****" + contact.slice(-3);
}

async function savePendingContact(contact: string) {
  const cookieStore = await cookies();
  cookieStore.set("pending_contact", contact, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: "/",
  });
}

async function getPendingContact(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("pending_contact")?.value ?? null;
}

async function clearPendingContact() {
  const cookieStore = await cookies();
  cookieStore.delete("pending_contact");
}

async function createOtp(contact: string, type: "register" | "forgot_password") {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db
    .delete(otpCodes)
    .where(and(eq(otpCodes.contact, contact), eq(otpCodes.type, type)));

  await db.insert(otpCodes).values({ contact, code, type, expiresAt });

  // TODO: kirim via email/SMS — sekarang hanya log di development
  console.log(`[OTP ${type}] ${contact} → ${code}`);
}

const DB_ERROR = "Terjadi kesalahan server. Silakan coba beberapa saat lagi.";

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(contact: string): Promise<ActionResult> {
  try {
    const existing = await db.query.users.findFirst({
      where: userWhereClause(contact),
    });

    if (existing?.isVerified) {
      return { error: "Akun dengan kontak ini sudah terdaftar." };
    }

    if (!existing) {
      await db.insert(users).values({
        email: isEmail(contact) ? contact : null,
        phone: !isEmail(contact) ? contact : null,
      });
    }

    await createOtp(contact, "register");
    await savePendingContact(contact);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/register/verify");
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyRegisterOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const otp = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.contact, contact),
        eq(otpCodes.code, code),
        eq(otpCodes.type, "register"),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date())
      ),
    });

    if (!otp) return { error: "Kode salah atau sudah kedaluarsa." };

    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
    await db.update(users).set({ isVerified: true }).where(userWhereClause(contact));
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/register/profile");
}

export async function resendRegisterOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };
  try {
    await createOtp(contact, "register");
  } catch {
    return { error: DB_ERROR };
  }
}

// ─── Complete Profile ─────────────────────────────────────────────────────────

export async function updateProfileAction(name: string, password: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [updatedUser] = await db
      .update(users)
      .set({ name, passwordHash, updatedAt: new Date() })
      .where(userWhereClause(contact))
      .returning({ id: users.id });

    await clearPendingContact();
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", updatedUser.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/");
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(contact: string, password: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({
      where: userWhereClause(contact),
    });

    if (!user || !user.passwordHash || !user.isVerified) {
      return { error: "Email/nomor telepon atau kata sandi salah." };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { error: "Email/nomor telepon atau kata sandi salah." };
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user_id", user.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/");
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(contact: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({
      where: userWhereClause(contact),
    });

    if (!user || !user.isVerified) {
      return { error: "Akun tidak ditemukan." };
    }

    await createOtp(contact, "forgot_password");
    await savePendingContact(contact);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/forgot-password/verify");
}

export async function verifyForgotPasswordOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const otp = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.contact, contact),
        eq(otpCodes.code, code),
        eq(otpCodes.type, "forgot_password"),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date())
      ),
    });

    if (!otp) return { error: "Kode salah atau sudah kedaluarsa." };

    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/forgot-password/reset");
}

export async function resendForgotPasswordOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };
  try {
    await createOtp(contact, "forgot_password");
  } catch {
    return { error: DB_ERROR };
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPasswordAction(password: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(userWhereClause(contact));

    await clearPendingContact();
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/login");
}

// ─── Util (bisa dipakai di pages) ─────────────────────────────────────────────

export async function getMaskedContact(): Promise<string> {
  const contact = await getPendingContact();
  if (!contact) return "";
  return maskContact(contact);
}
