"use server";

import { requireRole, type Role } from "@/lib/auth";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { and, eq, ilike, or, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type UserRow = {
  id: string;
  fullName: string | null;
  shopName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  totalListings: number;
};

export async function getAdminUsers({
  search = "",
  role,
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  role?: Role;
  page?: number;
  pageSize?: number;
}): Promise<{ users: UserRow[]; total: number }> {
  await requireRole("admin");

  const offset = (page - 1) * pageSize;

  // Subquery for listing count per seller
  const sq = db
    .select({
      sellerId: listings.sellerId,
      cnt: count(listings.id).as("cnt"),
    })
    .from(listings)
    .groupBy(listings.sellerId)
    .as("lc");

  // Build WHERE conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(users.fullName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.shopName, `%${search}%`),
        ilike(users.phone, `%${search}%`),
      ),
    );
  }
  if (role) {
    conditions.push(eq(users.role, role));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
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
        createdAt: users.createdAt,
        totalListings: sql<number>`coalesce(${sq.cnt}, 0)`,
      })
      .from(users)
      .leftJoin(sq, eq(sq.sellerId, users.id))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count(users.id) })
      .from(users)
      .where(whereClause),
  ]);

  return {
    users: rows.map((r) => ({
      ...r,
      totalListings: Number(r.totalListings),
    })),
    total: Number(countRows[0]?.total ?? 0),
  };
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
