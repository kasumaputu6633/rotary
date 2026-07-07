import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const notificationTypeEnum = pgEnum("notification_type", [
  "listing_deactivated",
  "listing_blocked",
  "favorite_reserved",
  "favorite_sold",
  "favorite_price_drop",
  "security_new_device",
  "security_password_changed",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    // Judul & isi disimpan sebagai teks saat kejadian (point-in-time), bukan
    // di-join saat render — agar notifikasi tetap benar meski listing berubah/dihapus.
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    href: text("href"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("notifications_recipient_created_idx").on(t.recipientId, t.createdAt),
    index("notifications_recipient_unread_idx").on(t.recipientId, t.isRead),
  ],
);

// Preferensi opt-out per kategori. Hanya kategori yang boleh dimatikan yang
// disimpan di sini — keamanan & penindakan (blokir) selalu aktif dan tidak
// punya kolom. Absennya baris = semua default aktif.
export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  favorites: boolean("favorites").notNull().default(true),
  listingActivity: boolean("listing_activity").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
