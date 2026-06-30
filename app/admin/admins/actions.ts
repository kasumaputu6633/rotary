"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, desc, eq, ilike, or, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { passwordValid } from "@/lib/password";
import { isEmailContact } from "@/lib/auth-contact";

export type AdminRow = {
  id: string;
  fullName: string | null;
  shopName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "admin" | "super_admin";
  isVerified: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
};

export type AdminActionResult = { success: boolean; error?: string };

// Daftar admin & super admin (hanya super_admin yang boleh mengakses).
export async function getAdmins({
  search = "",
}: {
  search?: string;
} = {}): Promise<{ admins: AdminRow[]; totalAdmins: number; totalSuperAdmins: number }> {
  await requireRole("super_admin");

  const roleFilter = or(eq(users.role, "admin"), eq(users.role, "super_admin"));
  const searchFilter = search
    ? or(
        ilike(users.fullName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.shopName, `%${search}%`),
      )
    : undefined;

  const [rows, counts] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        shopName: users.shopName,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isVerified: users.isVerified,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(searchFilter ? and(roleFilter, searchFilter) : roleFilter)
      .orderBy(desc(users.role), desc(users.createdAt)),
    db
      .select({
        role: users.role,
        cnt: count(users.id),
      })
      .from(users)
      .where(roleFilter)
      .groupBy(users.role),
  ]);

  let totalAdmins = 0;
  let totalSuperAdmins = 0;
  for (const c of counts) {
    if (c.role === "admin") totalAdmins = Number(c.cnt);
    if (c.role === "super_admin") totalSuperAdmins = Number(c.cnt);
  }

  return {
    admins: rows as AdminRow[],
    totalAdmins,
    totalSuperAdmins,
  };
}

// Promosikan user biasa menjadi admin.
export async function promoteToAdmin(userId: string): Promise<AdminActionResult> {
  await requireRole("super_admin");

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true, isVerified: true },
  });
  if (!target) return { success: false, error: "Pengguna tidak ditemukan." };
  if (target.role !== "user") {
    return { success: false, error: "Pengguna ini sudah memiliki peran admin." };
  }

  await db
    .update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/admins");
  revalidatePath("/admin/users");
  return { success: true };
}

// Turunkan admin menjadi user biasa. Super admin tidak bisa diturunkan lewat aksi ini.
export async function demoteAdmin(userId: string): Promise<AdminActionResult> {
  const current = await requireRole("super_admin");

  if (current.id === userId) {
    return { success: false, error: "Anda tidak dapat menurunkan peran Anda sendiri." };
  }

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });
  if (!target) return { success: false, error: "Pengguna tidak ditemukan." };
  if (target.role === "super_admin") {
    return { success: false, error: "Super admin tidak dapat diturunkan dari halaman ini." };
  }
  if (target.role !== "admin") {
    return { success: false, error: "Pengguna ini bukan admin." };
  }

  await db
    .update(users)
    .set({ role: "user", updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/admins");
  revalidatePath("/admin/users");
  return { success: true };
}

// Buat akun admin baru langsung (sudah terverifikasi).
export async function createAdmin(formData: FormData): Promise<AdminActionResult> {
  await requireRole("super_admin");

  const fullName = (formData.get("fullName") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string) ?? "";

  if (fullName.length < 2) {
    return { success: false, error: "Nama lengkap minimal 2 karakter." };
  }
  if (!isEmailContact(email)) {
    return { success: false, error: "Format email tidak valid." };
  }
  if (password.length > 128 || !passwordValid(password)) {
    return {
      success: false,
      error: "Kata sandi minimal 8 karakter dan memuat huruf besar, huruf kecil, serta angka.",
    };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (existing) {
    return { success: false, error: "Email ini sudah terdaftar." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  await db.insert(users).values({
    fullName,
    shopName: fullName,
    email,
    passwordHash,
    role: "admin",
    isVerified: true,
    emailVerifiedAt: now,
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin/users");
  return { success: true };
}

// Cari kandidat user biasa (terverifikasi) untuk dipromosikan jadi admin.
export async function searchPromotableUsers(query: string): Promise<
  { id: string; name: string; email: string | null; avatarUrl: string | null }[]
> {
  await requireRole("super_admin");

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const rows = await db
    .select({
      id: users.id,
      name: sql<string>`coalesce(${users.fullName}, ${users.shopName}, ${users.email})`,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "user"),
        or(
          ilike(users.fullName, `%${trimmed}%`),
          ilike(users.email, `%${trimmed}%`),
          ilike(users.shopName, `%${trimmed}%`),
        ),
      ),
    )
    .orderBy(desc(users.createdAt))
    .limit(8);

  return rows;
}
