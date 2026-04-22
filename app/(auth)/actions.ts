"use server";

import { db } from "@/db";
import { otpCodes, userDevices, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendOtpEmail, type OtpEmailType } from "@/lib/email";

type ActionResult = { error: string } | undefined;

const DB_ERROR = "Terjadi kesalahan server. Silakan coba beberapa saat lagi.";

const COOKIE = {
  session: { httpOnly: true, maxAge: 60 * 60 * 24 * 7,  path: "/" },
  device:  { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" },
  pending: { httpOnly: true, maxAge: 60 * 10,            path: "/" },
} as const;

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function isEmail(contact: string) {
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

async function getCookie(name: string) {
  return (await cookies()).get(name)?.value ?? null;
}

async function setPendingContact(contact: string) {
  (await cookies()).set("pending_contact", contact, COOKIE.pending);
}

async function getPendingContact() {
  return getCookie("pending_contact");
}

async function setPendingLoginUserId(userId: string) {
  (await cookies()).set("pending_login_user_id", userId, COOKIE.pending);
}

async function getPendingLoginUserId() {
  return getCookie("pending_login_user_id");
}

async function createSession(userId: string) {
  (await cookies()).set("session_user_id", userId, COOKIE.session);
}

async function trustDevice(userId: string) {
  const token = crypto.randomUUID();
  await db.insert(userDevices).values({ userId, deviceToken: token });
  (await cookies()).set("rotary_device", token, COOKIE.device);
}

async function clearPendingContact() {
  (await cookies()).delete("pending_contact");
}

async function clearPendingLogin() {
  const store = await cookies();
  store.delete("pending_login_user_id");
  store.delete("pending_contact");
}

// ─── OTP ──────────────────────────────────────────────────────────────────────

async function createAndSendOtp(
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
  } else {
    // TODO: integrasi SMS (Twilio / Vonage)
    console.log(`[OTP SMS] ${contact} → ${code}`);
  }
}

async function verifyOtp(contact: string, code: string, type: OtpEmailType) {
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

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(contact: string): Promise<ActionResult> {
  try {
    const existing = await db.query.users.findFirst({ where: userWhereClause(contact) });

    if (existing?.isVerified) return { error: "Akun dengan kontak ini sudah terdaftar." };

    if (!existing) {
      await db.insert(users).values({
        email: isEmail(contact) ? contact : null,
        phone: !isEmail(contact) ? contact : null,
      });
    }

    await createAndSendOtp(contact, "register");
    await setPendingContact(contact);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/register/verify");
}

export async function verifyRegisterOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const valid = await verifyOtp(contact, code, "register");
    if (!valid) return { error: "Kode salah atau sudah kedaluarsa." };
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
    await createAndSendOtp(contact, "register");
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
    const [user] = await db
      .update(users)
      .set({ name, passwordHash, updatedAt: new Date() })
      .where(userWhereClause(contact))
      .returning({ id: users.id });

    await clearPendingContact();
    await trustDevice(user.id);
    await createSession(user.id);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/");
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(contact: string, password: string): Promise<ActionResult> {
  let needsDeviceVerify = false;

  try {
    const user = await db.query.users.findFirst({ where: userWhereClause(contact) });

    if (!user || !user.passwordHash || !user.isVerified) {
      return { error: "Email/nomor telepon atau kata sandi salah." };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return { error: "Email/nomor telepon atau kata sandi salah." };

    const deviceToken = await getCookie("rotary_device");
    const isKnownDevice =
      deviceToken !== null &&
      !!(await db.query.userDevices.findFirst({
        where: and(eq(userDevices.userId, user.id), eq(userDevices.deviceToken, deviceToken)),
      }));

    if (isKnownDevice) {
      await createSession(user.id);
    } else {
      const otpContact = user.email ?? user.phone!;
      await createAndSendOtp(otpContact, "login_verify", user.name);
      await setPendingContact(otpContact);
      await setPendingLoginUserId(user.id);
      needsDeviceVerify = true;
    }
  } catch {
    return { error: DB_ERROR };
  }

  if (needsDeviceVerify) redirect("/login/verify");
  redirect("/");
}

// ─── Login OTP (Perangkat Baru) ───────────────────────────────────────────────

export async function verifyLoginOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  const userId = await getPendingLoginUserId();
  if (!contact || !userId) return { error: "Sesi habis, silakan masuk kembali." };

  try {
    const valid = await verifyOtp(contact, code, "login_verify");
    if (!valid) return { error: "Kode salah atau sudah kedaluarsa." };

    await clearPendingLogin();
    await trustDevice(userId);
    await createSession(userId);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/");
}

export async function resendLoginOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  const userId = await getPendingLoginUserId();
  if (!contact || !userId) return { error: "Sesi habis, silakan masuk kembali." };
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { name: true },
    });
    await createAndSendOtp(contact, "login_verify", user?.name);
  } catch {
    return { error: DB_ERROR };
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(contact: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({ where: userWhereClause(contact) });
    if (!user || !user.isVerified) return { error: "Akun tidak ditemukan." };

    await createAndSendOtp(contact, "forgot_password", user.name);
    await setPendingContact(contact);
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/forgot-password/verify");
}

export async function verifyForgotPasswordOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const valid = await verifyOtp(contact, code, "forgot_password");
    if (!valid) return { error: "Kode salah atau sudah kedaluarsa." };
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/forgot-password/reset");
}

export async function resendForgotPasswordOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };
  try {
    const user = await db.query.users.findFirst({
      where: userWhereClause(contact),
      columns: { name: true },
    });
    await createAndSendOtp(contact, "forgot_password", user?.name);
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
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(userWhereClause(contact));
    await clearPendingContact();
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/login");
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export async function getMaskedContact(): Promise<string> {
  const contact = await getPendingContact();
  return contact ? maskContact(contact) : "";
}
