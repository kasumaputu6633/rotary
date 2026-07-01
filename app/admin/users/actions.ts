"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { and, eq, ne, ilike, or, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isEmailContact } from "@/lib/auth-contact";

export type UserRow = {
  id: string;
  fullName: string | null;
  shopName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
  totalListings: number;
};

export type UserActionResult = { success: boolean; error?: string };

// Daftar user biasa saja — admin & super admin tidak ditampilkan di sini.
export async function getAdminUsers({
  search = "",
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ users: UserRow[]; total: number }> {
  await requireRole("admin");

  const offset = (page - 1) * pageSize;

  // Subquery jumlah listing per seller
  const sq = db
    .select({
      sellerId: listings.sellerId,
      cnt: count(listings.id).as("cnt"),
    })
    .from(listings)
    .groupBy(listings.sellerId)
    .as("lc");

  const conditions = [eq(users.role, "user")];
  if (search) {
    conditions.push(
      or(
        ilike(users.fullName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.shopName, `%${search}%`),
        ilike(users.phone, `%${search}%`),
      )!,
    );
  }
  const whereClause = and(...conditions);

  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        shopName: users.shopName,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        totalListings: sql<number>`coalesce(${sq.cnt}, 0)`,
      })
      .from(users)
      .leftJoin(sq, eq(sq.sellerId, users.id))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset),

    db.select({ total: count(users.id) }).from(users).where(whereClause),
  ]);

  return {
    users: rows.map((r) => ({
      ...r,
      totalListings: Number(r.totalListings),
    })),
    total: Number(countRows[0]?.total ?? 0),
  };
}

// Statistik global khusus user biasa untuk kartu ringkasan.
export async function getUsersStats(): Promise<{
  total: number;
  verified: number;
  unverified: number;
  totalListings: number;
}> {
  await requireRole("admin");

  const userFilter = eq(users.role, "user");

  const [userCounts, listingCount] = await Promise.all([
    db
      .select({
        total: count(users.id),
        verified: sql<number>`count(*) filter (where ${users.isVerified} = true)`,
      })
      .from(users)
      .where(userFilter),
    db
      .select({ total: count(listings.id) })
      .from(listings)
      .innerJoin(
        users,
        and(eq(users.id, listings.sellerId), eq(users.role, "user")),
      ),
  ]);

  const total = Number(userCounts[0]?.total ?? 0);
  const verified = Number(userCounts[0]?.verified ?? 0);

  return {
    total,
    verified,
    unverified: total - verified,
    totalListings: Number(listingCount[0]?.total ?? 0),
  };
}

// Perbarui data user biasa (hanya role "user" yang boleh diedit di sini).
export async function updateUser(
  userId: string,
  data: {
    fullName: string;
    shopName: string;
    email: string;
    phone: string;
    isVerified: boolean;
  },
): Promise<UserActionResult> {
  await requireRole("admin");

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });
  if (!target) return { success: false, error: "Pengguna tidak ditemukan." };
  if (target.role !== "user") {
    return { success: false, error: "Hanya user biasa yang dapat diedit di sini." };
  }

  const fullName = data.fullName?.trim() || null;
  const shopName = data.shopName?.trim() || null;
  const email = data.email?.trim().toLowerCase() || null;
  const phone = data.phone?.trim() || null;

  if (email && !isEmailContact(email)) {
    return { success: false, error: "Format email tidak valid." };
  }

  // Cek keunikan email & telepon terhadap pengguna lain.
  if (email) {
    const existing = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, userId)),
      columns: { id: true },
    });
    if (existing) return { success: false, error: "Email sudah digunakan pengguna lain." };
  }
  if (phone) {
    const existing = await db.query.users.findFirst({
      where: and(eq(users.phone, phone), ne(users.id, userId)),
      columns: { id: true },
    });
    if (existing) return { success: false, error: "Nomor telepon sudah digunakan pengguna lain." };
  }

  try {
    await db
      .update(users)
      .set({
        fullName,
        shopName,
        email,
        phone,
        isVerified: data.isVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[updateUser]", err);
    return { success: false, error: "Gagal memperbarui pengguna." };
  }
}

export async function deleteUser(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireRole("admin");

  if (currentUser.id === userId) {
    return {
      success: false,
      error: "Anda tidak dapat menghapus akun Anda sendiri.",
    };
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[deleteUser]", err);
    return { success: false, error: "Gagal menghapus pengguna." };
  }
}
