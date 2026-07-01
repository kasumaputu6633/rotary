"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { listingImages, listings, users } from "@/db/schema";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ListingMode, ListingStatus } from "@/lib/listing-format";

export type AdminListingRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  mode: ListingMode;
  price: number | null;
  status: ListingStatus;
  viewCount: number;
  publishedAt: Date | null;
  sellerName: string | null;
  imageUrl: string | null;
};

export type AdminListingStats = {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  blocked: number;
};

export async function getAdminListings({
  search = "",
  status,
  mode,
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  status?: ListingStatus;
  mode?: ListingMode;
  page?: number;
  pageSize?: number;
}): Promise<{
  listings: AdminListingRow[];
  total: number;
  stats: AdminListingStats;
}> {
  await requireRole("admin");

  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(listings.title, `%${search}%`),
        ilike(users.fullName, `%${search}%`),
        ilike(users.shopName, `%${search}%`),
      ),
    );
  }
  if (status) conditions.push(eq(listings.status, status));
  if (mode) conditions.push(eq(listings.mode, mode));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows, statsRows] = await Promise.all([
    db
      .select({
        id: listings.id,
        slug: listings.slug,
        title: listings.title,
        category: listings.category,
        mode: listings.mode,
        price: listings.price,
        status: listings.status,
        viewCount: listings.viewCount,
        publishedAt: listings.publishedAt,
        sellerName: sql<
          string | null
        >`coalesce(${users.shopName}, ${users.fullName})`,
        imageUrl: listingImages.imageUrl,
      })
      .from(listings)
      .leftJoin(users, eq(users.id, listings.sellerId))
      .leftJoin(
        listingImages,
        and(
          eq(listingImages.listingId, listings.id),
          eq(listingImages.sortOrder, 0),
        ),
      )
      .where(whereClause)
      .orderBy(desc(listings.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count(listings.id) })
      .from(listings)
      .leftJoin(users, eq(users.id, listings.sellerId))
      .where(whereClause),

    db
      .select({
        total: count(listings.id),
        active: sql<number>`count(*) filter (where ${listings.status} = 'active')::int`,
        draft: sql<number>`count(*) filter (where ${listings.status} = 'draft')::int`,
        inactive: sql<number>`count(*) filter (where ${listings.status} = 'inactive')::int`,
        blocked: sql<number>`count(*) filter (where ${listings.status} = 'blocked')::int`,
      })
      .from(listings),
  ]);

  const s = statsRows[0] ?? {
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
    blocked: 0,
  };

  return {
    listings: rows.map((r) => ({
      ...r,
      viewCount: Number(r.viewCount),
    })),
    total: Number(countRows[0]?.total ?? 0),
    stats: {
      total: Number(s.total),
      active: Number(s.active),
      draft: Number(s.draft),
      inactive: Number(s.inactive),
      blocked: Number(s.blocked),
    },
  };
}

export async function updateListingStatus(
  id: string,
  status: ListingStatus,
): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  try {
    await db
      .update(listings)
      .set({ status, updatedAt: new Date() })
      .where(eq(listings.id, id));
    revalidatePath("/admin/listings");
    return { success: true };
  } catch (err) {
    console.error("[updateListingStatus]", err);
    return { success: false, error: "Gagal memperbarui status listing." };
  }
}

export async function deleteListing(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  try {
    await db.delete(listings).where(eq(listings.id, id));
    revalidatePath("/admin/listings");
    return { success: true };
  } catch (err) {
    console.error("[deleteListing]", err);
    return { success: false, error: "Gagal menghapus listing." };
  }
}
