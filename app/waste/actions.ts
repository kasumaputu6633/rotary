"use server";

import { db } from "@/db";
import { wasteLocations } from "@/db/schema";
import { eq } from "drizzle-orm";

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
