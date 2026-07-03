"use server";

import { requireRole } from "@/lib/auth";
import {
  getNotificationPreferences,
  setNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function saveNotificationPreferencesAction(
  prefs: NotificationPreferences,
): Promise<void> {
  const user = await requireRole("user");
  await setNotificationPreferences(user.id, {
    favorites: !!prefs.favorites,
    listingActivity: !!prefs.listingActivity,
  });
  revalidatePath("/account/notifications");
}

export async function getNotificationPreferencesAction(): Promise<NotificationPreferences> {
  const user = await requireRole("user");
  return getNotificationPreferences(user.id);
}
