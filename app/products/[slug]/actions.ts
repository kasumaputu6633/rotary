"use server";

import { db } from "@/db";
import { complaints, listings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { COMPLAINT_CATEGORIES } from "@/lib/moderation-format";
import { and, eq, inArray } from "drizzle-orm";

type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitComplaintAction(input: {
  listingId: string;
  category: string;
  description: string;
}): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Silakan masuk terlebih dahulu untuk melapor." };
  }

  const category = input.category?.trim();
  if (!category || !COMPLAINT_CATEGORIES.includes(category as never)) {
    return { ok: false, error: "Kategori laporan tidak valid." };
  }

  const description = input.description?.trim() ?? "";
  if (description.length > 1000) {
    return { ok: false, error: "Deskripsi maksimal 1000 karakter." };
  }

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, input.listingId),
    columns: { id: true, sellerId: true },
  });
  if (!listing) {
    return { ok: false, error: "Listing tidak ditemukan." };
  }
  if (listing.sellerId === user.id) {
    return { ok: false, error: "Anda tidak dapat melaporkan listing sendiri." };
  }

  // Cegah spam: satu laporan terbuka per pengguna per listing.
  const existing = await db.query.complaints.findFirst({
    where: and(
      eq(complaints.reporterId, user.id),
      eq(complaints.targetListingId, input.listingId),
      inArray(complaints.status, ["new", "reviewing"]),
    ),
    columns: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      error: "Anda sudah melaporkan listing ini dan masih ditinjau.",
    };
  }

  await db.insert(complaints).values({
    reporterId: user.id,
    targetType: "listing",
    targetListingId: input.listingId,
    category,
    description: description || null,
  });

  return { ok: true };
}
