"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import {
  complaints,
  listingImages,
  listings,
  users,
  wasteLocations,
} from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ModerationQueueItem = {
  id: string;
  kind: "listing";
  title: string;
  slug: string;
  sellerName: string | null;
  status: string;
  openComplaints: number;
  topCategory: string | null;
  imageUrl: string | null;
  createdAt: Date;
};

export type ModerationWasteItem = {
  id: string;
  namaUsaha: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
};

export type ModerationStats = {
  pendingListings: number;
  blockedListings: number;
  wasteLocations: number;
  resolvedThisMonth: number;
};

export async function getModerationData(): Promise<{
  flaggedListings: ModerationQueueItem[];
  wasteLocations: ModerationWasteItem[];
  stats: ModerationStats;
}> {
  await requireRole("admin");

  const [flaggedRows, wasteRows, statsRows] = await Promise.all([
    // Listing yang punya komplain terbuka (new/reviewing) — antrean moderasi riil.
    db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        status: listings.status,
        sellerName: sql<
          string | null
        >`coalesce(${users.shopName}, ${users.fullName})`,
        openComplaints: sql<number>`count(${complaints.id})::int`,
        topCategory: sql<
          string | null
        >`(array_agg(${complaints.category} order by ${complaints.createdAt} desc))[1]`,
        imageUrl: listingImages.imageUrl,
        createdAt: listings.createdAt,
      })
      .from(complaints)
      .innerJoin(listings, eq(listings.id, complaints.targetListingId))
      .leftJoin(users, eq(users.id, listings.sellerId))
      .leftJoin(
        listingImages,
        and(
          eq(listingImages.listingId, listings.id),
          eq(listingImages.sortOrder, 0),
        ),
      )
      .where(inArray(complaints.status, ["new", "reviewing"]))
      .groupBy(
        listings.id,
        listings.title,
        listings.slug,
        listings.status,
        users.shopName,
        users.fullName,
        listingImages.imageUrl,
        listings.createdAt,
      )
      .orderBy(desc(sql`count(${complaints.id})`))
      .limit(50),

    // Lokasi limbah untuk review konten (mis. field type yang bisa disalahgunakan).
    db
      .select({
        id: wasteLocations.id,
        namaUsaha: wasteLocations.namaUsaha,
        type: wasteLocations.type,
        isActive: wasteLocations.isActive,
        createdAt: wasteLocations.createdAt,
      })
      .from(wasteLocations)
      .orderBy(desc(wasteLocations.createdAt))
      .limit(20),

    db
      .select({
        blockedListings: sql<number>`count(*) filter (where ${listings.status} = 'blocked')::int`,
      })
      .from(listings),
  ]);

  const wasteCountRows = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(wasteLocations);

  const resolvedRows = await db
    .select({
      resolved: sql<number>`count(*) filter (where ${complaints.status} = 'resolved' and ${complaints.resolvedAt} >= date_trunc('month', now()))::int`,
    })
    .from(complaints);

  return {
    flaggedListings: flaggedRows.map((r) => ({
      id: r.id,
      kind: "listing" as const,
      title: r.title,
      slug: r.slug,
      sellerName: r.sellerName,
      status: r.status,
      openComplaints: Number(r.openComplaints),
      topCategory: r.topCategory,
      imageUrl: r.imageUrl,
      createdAt: r.createdAt,
    })),
    wasteLocations: wasteRows,
    stats: {
      pendingListings: flaggedRows.length,
      blockedListings: Number(statsRows[0]?.blockedListings ?? 0),
      wasteLocations: Number(wasteCountRows[0]?.total ?? 0),
      resolvedThisMonth: Number(resolvedRows[0]?.resolved ?? 0),
    },
  };
}

// Blokir listing sekaligus selesaikan komplain terbukanya dalam satu langkah.
export async function blockListingFromModeration(
  listingId: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole("admin");

  try {
    await db
      .update(listings)
      .set({ status: "blocked", updatedAt: new Date() })
      .where(eq(listings.id, listingId));

    await db
      .update(complaints)
      .set({
        status: "resolved",
        handledById: admin.id,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(complaints.targetListingId, listingId),
          inArray(complaints.status, ["new", "reviewing"]),
        ),
      );

    revalidatePath("/admin/moderation");
    revalidatePath("/admin/listings");
    revalidatePath("/admin/complains");
    return { success: true };
  } catch (err) {
    console.error("[blockListingFromModeration]", err);
    return { success: false, error: "Gagal memblokir listing." };
  }
}

// Konten aman: tolak komplain terkait tanpa memblokir listing.
export async function dismissListingComplaints(
  listingId: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole("admin");

  try {
    await db
      .update(complaints)
      .set({
        status: "rejected",
        handledById: admin.id,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(complaints.targetListingId, listingId),
          inArray(complaints.status, ["new", "reviewing"]),
        ),
      );

    revalidatePath("/admin/moderation");
    revalidatePath("/admin/complains");
    return { success: true };
  } catch (err) {
    console.error("[dismissListingComplaints]", err);
    return { success: false, error: "Gagal menolak komplain." };
  }
}

export async function setWasteLocationActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  try {
    await db
      .update(wasteLocations)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(wasteLocations.id, id));
    revalidatePath("/admin/moderation");
    revalidatePath("/admin/waste-locations");
    return { success: true };
  } catch (err) {
    console.error("[setWasteLocationActive]", err);
    return { success: false, error: "Gagal memperbarui lokasi limbah." };
  }
}
