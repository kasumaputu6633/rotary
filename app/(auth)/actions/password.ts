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

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function forgotPasswordAction(contact: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({ where: userWhereClause(contact) });
    if (user?.email && user.emailVerifiedAt) {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

      const token = crypto.randomUUID().replace(/-/g, "");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

      const resetUrl = `${await getBaseUrl()}/forgot-password/reset?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl, user.fullName);
    }
  } catch {
    // Respons sengaja tetap sama agar status keberadaan akun tidak dapat ditebak.
  }
  redirect("/forgot-password/sent");
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

    await recordLoginActivity(record.userId, "password_reset", { method: "email_link" });
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
