"use server";

import { db } from "@/db";
import { users, userDevices } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  ActionResult,
  DB_ERROR,
} from "./constants";
import {
  userWhereClause,
  getCookie,
  setPendingContact,
  setPendingLoginUserId,
  getPendingContact,
  getPendingLoginUserId,
  createSession,
  trustDevice,
  clearPendingLogin,
  createAndSendOtp,
  verifyOtp,
} from "./shared";

export async function loginAction(contact: string, password: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({ where: userWhereClause(contact) });

    if (!user || !user.passwordHash || !user.isVerified) {
      return { error: "Email/nomor telepon atau kata sandi salah." };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return { error: "Email/nomor telepon atau kata sandi salah." };

    const userRole = user.role ?? "user";
    const deviceToken = await getCookie("rotary_device");
    
    const isKnownDevice =
      deviceToken !== null &&
      !!(await db.query.userDevices.findFirst({
        where: and(eq(userDevices.userId, user.id), eq(userDevices.deviceToken, deviceToken)),
      }));

    if (isKnownDevice) {
      await createSession(user.id);
      const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/";
      return { redirectTo: redirectPath };
    }

    const otpContact = user.email ?? user.phone!;
    await createAndSendOtp(otpContact, "login_verify", user.name);
    await setPendingContact(otpContact);
    await setPendingLoginUserId(user.id);
    return { redirectTo: "/login/verify" };
  } catch {
    return { error: DB_ERROR };
  }
}

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

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });
    
    const redirectPath = user?.role === "admin" ? "/admin/dashboard" : "/";
    return { redirectTo: redirectPath };
  } catch {
    return { error: DB_ERROR };
  }
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
