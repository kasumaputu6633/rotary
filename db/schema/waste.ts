import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";

import { users } from "./auth";

export const wasteLocations = pgTable("waste_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  // varchar agar admin bisa menambah tipe baru (bank_sampah, dropbox, komunitas, dll.) tanpa migrasi DDL
  type: varchar("type", { length: 50 }).notNull().default("tps"),
  namaUsaha: varchar("nama_usaha", { length: 255 }).notNull(),
  namaPic: varchar("nama_pic", { length: 255 }),
  emailKontak: varchar("email_kontak", { length: 255 }),
  teleponKontak: varchar("telepon_kontak", { length: 20 }),
  alamat: text("alamat"),
  website: varchar("website", { length: 255 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  jenisSampahDiterima: text("jenis_sampah_diterima").array(),
  operatingHours: jsonb("operating_hours").$type<Record<string, { open?: string; close?: string; isClosed?: boolean }>>(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const savedWasteLocations = pgTable(
  "saved_waste_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => wasteLocations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("saved_waste_locations_user_id_idx").on(table.userId),
    index("saved_waste_locations_location_id_idx").on(table.locationId),
    uniqueIndex("saved_waste_locations_user_location_unique").on(table.userId, table.locationId),
  ]
);

export const recentWasteLocations = pgTable(
  "recent_waste_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => wasteLocations.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("recent_waste_locations_user_id_idx").on(table.userId),
    uniqueIndex("recent_waste_locations_user_location_unique").on(table.userId, table.locationId),
  ]
);
