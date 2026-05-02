"use server";

import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendPasswordResetEmail } from "@/lib/email";
import { ActionResult, DB_ERROR, userWhereClause } from "./shared";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function forgotPasswordAction(contact: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({ where: userWhereClause(contact) });
    if (!user || !user.isVerified) return { error: "Akun tidak ditemukan." };
    if (!user.email) return { error: "Akun ini tidak memiliki email terdaftar." };

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

    const resetUrl = `${await getBaseUrl()}/forgot-password/reset?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl, user.name);
  } catch {
    return { error: DB_ERROR };
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
    const record = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    });

    if (!record) return { error: "Link tidak valid atau sudah kedaluarsa." };

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, record.userId));

    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, record.id));
  } catch {
    return { error: DB_ERROR };
  }
  redirect("/login");
}
