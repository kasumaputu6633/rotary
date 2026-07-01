"use server";

import { db } from "@/db";
import { recentWasteLocations, savedWasteLocations, wasteLocations } from "@/db/schema";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
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
