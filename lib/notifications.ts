import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { favoriteListings, notificationPreferences, notifications } from "@/db/schema";

export type NotificationType =
  | "listing_deactivated"
  | "listing_blocked"
  | "favorite_reserved"
  | "favorite_sold"
  | "favorite_price_drop"
  | "security_new_device"
  | "security_password_changed";

// Kategori preferensi yang boleh dimatikan user. Keamanan & penindakan (blokir)
// tidak termasuk — selalu aktif.
export type PreferenceCategory = "favorites" | "listingActivity";

export type NotificationPreferences = {
  favorites: boolean;
  listingActivity: boolean;
};

export type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  isRead: boolean;
  createdAt: Date;
};

type NewNotification = {
  recipientId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  href?: string | null;
};

/** Tulis satu notifikasi. Best-effort: kegagalan tidak boleh menggagalkan aksi utama. */
export async function createNotification(input: NewNotification): Promise<void> {
  try {
    await db.insert(notifications).values({
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    });
  } catch (err) {
    console.error("[createNotification]", err);
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  favorites: true,
  listingActivity: true,
};

/** Baca preferensi user. Tidak ada baris = semua default aktif. */
export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const [row] = await db
    .select({
      favorites: notificationPreferences.favorites,
      listingActivity: notificationPreferences.listingActivity,
    })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
  return row ?? DEFAULT_PREFERENCES;
}

/** Simpan preferensi user (upsert). */
export async function setNotificationPreferences(
  userId: string,
  prefs: NotificationPreferences,
): Promise<void> {
  await db
    .insert(notificationPreferences)
    .values({ userId, ...prefs, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: { ...prefs, updatedAt: new Date() },
    });
}

/**
 * Tulis notifikasi single yang di-gate kategori preferensi. Dipakai untuk
 * event kategori "listingActivity" (mis. penonaktifan otomatis). Kategori
 * keamanan/blokir TIDAK lewat sini — mereka selalu aktif via createNotification.
 */
export async function createNotificationIfEnabled(
  input: NewNotification,
  category: PreferenceCategory,
): Promise<void> {
  try {
    const prefs = await getNotificationPreferences(input.recipientId);
    if (!prefs[category]) return;
    await createNotification(input);
  } catch (err) {
    console.error("[createNotificationIfEnabled]", err);
  }
}

/**
 * Tulis notifikasi untuk semua user yang memfavoritkan sebuah listing, kecuali
 * yang mematikan kategori "favorites". `build` mengembalikan payload tanpa
 * recipientId. `excludeUserId` melewati pemilik listing.
 */
export async function notifyFavoriters(
  listingId: string,
  build: (recipientId: string) => Omit<NewNotification, "recipientId">,
  excludeUserId?: string,
): Promise<number> {
  try {
    const rows = await db
      .select({ userId: favoriteListings.userId })
      .from(favoriteListings)
      .where(eq(favoriteListings.listingId, listingId));

    const candidates = rows
      .map((r) => r.userId)
      .filter((id) => id !== excludeUserId);

    if (candidates.length === 0) return 0;

    // Buang penerima yang mematikan kategori "favorites". Tidak ada baris =
    // default aktif, jadi hanya yang eksplisit false yang di-opt-out.
    const optedOut = await db
      .select({ userId: notificationPreferences.userId })
      .from(notificationPreferences)
      .where(
        and(
          inArray(notificationPreferences.userId, candidates),
          eq(notificationPreferences.favorites, false),
        ),
      );
    const optedOutSet = new Set(optedOut.map((r) => r.userId));
    const recipients = candidates.filter((id) => !optedOutSet.has(id));

    if (recipients.length === 0) return 0;

    await db.insert(notifications).values(
      recipients.map((recipientId) => ({
        recipientId,
        ...build(recipientId),
      })),
    );

    return recipients.length;
  } catch (err) {
    console.error("[notifyFavoriters]", err);
    return 0;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false),
      ),
    );
  return row?.count ?? 0;
}

export async function getRecentNotifications(
  userId: string,
  limit = 15,
): Promise<NotificationRow[]> {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      href: notifications.href,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.id, id), eq(notifications.recipientId, userId)),
    );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false),
      ),
    );
}
