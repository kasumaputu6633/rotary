import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  doublePrecision,
  integer
} from "drizzle-orm/pg-core";

export const wasteLocationTypeEnum = pgEnum("waste_location_type", ["tps", "vendor"]);

export const wasteLocations = pgTable("waste_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: wasteLocationTypeEnum("type").notNull().default("tps"),
  namaUsaha: varchar("nama_usaha", { length: 255 }).notNull(),
  namaPic: varchar("nama_pic", { length: 255 }),
  emailKontak: varchar("email_kontak", { length: 255 }),
  teleponKontak: varchar("telepon_kontak", { length: 20 }),
  alamat: text("alamat"),
  website: varchar("website", { length: 255 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  jenisSampahDiterima: text("jenis_sampah_diterima").array(),
  operatingHours: varchar("operating_hours", { length: 255 }),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
