import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { recentWasteLocations, savedWasteLocations, wasteLocations } from "@/db/schema";

export async function getSavedWasteLocationIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ locationId: savedWasteLocations.locationId })
    .from(savedWasteLocations)
    .where(eq(savedWasteLocations.userId, userId));

  return rows.map((row) => row.locationId);
}

export async function getRecentWasteLocationIds(userId: string, limit = 12): Promise<string[]> {
  const rows = await db
    .select({ locationId: recentWasteLocations.locationId })
    .from(recentWasteLocations)
    .innerJoin(wasteLocations, eq(wasteLocations.id, recentWasteLocations.locationId))
    .where(and(eq(recentWasteLocations.userId, userId), eq(wasteLocations.isActive, true)))
    .orderBy(desc(recentWasteLocations.viewedAt))
    .limit(limit);

  return rows.map((row) => row.locationId);
}

export async function getSavedWasteLocations(userId: string) {
  const rows = await db
    .select({ location: wasteLocations })
    .from(savedWasteLocations)
    .innerJoin(wasteLocations, eq(wasteLocations.id, savedWasteLocations.locationId))
    .where(and(eq(savedWasteLocations.userId, userId), eq(wasteLocations.isActive, true)))
    .orderBy(desc(savedWasteLocations.createdAt));

  return rows.map((row) => row.location);
}

export async function getRecentWasteLocations(userId: string, limit = 8) {
  const rows = await db
    .select({ location: wasteLocations })
    .from(recentWasteLocations)
    .innerJoin(wasteLocations, eq(wasteLocations.id, recentWasteLocations.locationId))
    .where(and(eq(recentWasteLocations.userId, userId), eq(wasteLocations.isActive, true)))
    .orderBy(desc(recentWasteLocations.viewedAt))
    .limit(limit);

  return rows.map((row) => row.location);
}
