"use server";

import { db } from "@/db";
import { complaints, recentWasteLocations, savedWasteLocations, wasteLocations } from "@/db/schema";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { COMPLAINT_CATEGORIES } from "@/lib/moderation-format";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type WasteLocation = typeof wasteLocations.$inferSelect;

/**
 * Fetches all active waste locations from the database.
 */
export async function getWasteLocations(): Promise<WasteLocation[]> {
  try {
    const locations = await db
      .select()
      .from(wasteLocations)
      .where(eq(wasteLocations.isActive, true));

    return locations;
  } catch (error) {
    console.error("Error fetching waste locations:", error);
    // Return empty array on error to prevent breaking the map UI
    return [];
  }
}

/**
 * Toggles a waste location bookmark for the current user.
 * Guests are redirected to /login by requireAuth().
 * Returns the resulting saved state so the client can sync.
 */
export async function toggleSavedWasteLocationAction(locationId: string): Promise<boolean> {
  const user = await requireAuth();

  const existing = await db.query.savedWasteLocations.findFirst({
    where: and(
      eq(savedWasteLocations.userId, user.id),
      eq(savedWasteLocations.locationId, locationId),
    ),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(savedWasteLocations).where(eq(savedWasteLocations.id, existing.id));
  } else {
    await db
      .insert(savedWasteLocations)
      .values({ userId: user.id, locationId })
      .onConflictDoNothing();
  }

  revalidatePath("/account/saved");

  return !existing;
}

/**
 * Records that the current user viewed a waste location.
 * No-op for guests; upserts viewedAt for logged-in users.
 */
export async function recordRecentWasteLocationAction(locationId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await db
    .insert(recentWasteLocations)
    .values({ userId: user.id, locationId })
    .onConflictDoUpdate({
      target: [recentWasteLocations.userId, recentWasteLocations.locationId],
      set: { viewedAt: new Date() },
    });

  revalidatePath("/account/saved");
}

type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitWasteComplaintAction(input: {
  locationId: string;
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

  const location = await db.query.wasteLocations.findFirst({
    where: eq(wasteLocations.id, input.locationId),
    columns: { id: true },
  });
  if (!location) {
    return { ok: false, error: "Lokasi limbah tidak ditemukan." };
  }

  // Cegah spam: satu laporan terbuka per pengguna per lokasi.
  const existing = await db.query.complaints.findFirst({
    where: and(
      eq(complaints.reporterId, user.id),
      eq(complaints.targetWasteLocationId, input.locationId),
      inArray(complaints.status, ["new", "reviewing"]),
    ),
    columns: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      error: "Anda sudah melaporkan lokasi ini dan masih ditinjau.",
    };
  }

  await db.insert(complaints).values({
    reporterId: user.id,
    targetType: "waste_location",
    targetWasteLocationId: input.locationId,
    category,
    description: description || null,
  });

  return { ok: true };
}
