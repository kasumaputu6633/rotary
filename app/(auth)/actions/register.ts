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

    await setPendingContact(contact);
    if (canBypassOtp(contact)) {
      await db.update(users).set({ isVerified: true, updatedAt: new Date() }).where(userWhereClause(contact));
      return { redirectTo: "/register/profile" };
    }

    await createAndSendOtp(contact, "register");
    return { redirectTo: "/register/verify" };
  } catch {
    return { error: DB_ERROR };
  }
}

export async function verifyRegisterOtpAction(code: string): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };

  try {
    const valid = canBypassOtp(contact) || await verifyOtp(contact, code, "register");
    if (!valid) return { error: "Kode salah atau sudah kedaluarsa." };
    await db.update(users).set({ isVerified: true }).where(userWhereClause(contact));
    return { redirectTo: "/register/profile" };
  } catch {
    return { error: DB_ERROR };
  }
}

export async function resendRegisterOtpAction(): Promise<ActionResult> {
  const contact = await getPendingContact();
  if (!contact) return { error: "Sesi habis, silakan mulai ulang." };
  try {
    if (canBypassOtp(contact)) return {};
    await createAndSendOtp(contact, "register");
  } catch {
    return { error: DB_ERROR };
  }
}

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
    return { redirectTo: "/" };
  } catch {
    return { error: DB_ERROR };
  }
}
