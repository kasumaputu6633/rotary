import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
  doublePrecision,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const otpTypeEnum = pgEnum("otp_type", ["register", "forgot_password", "login_verify"]);
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const listingModeEnum = pgEnum("listing_mode", ["sale", "donation"]);
export const listingStatusEnum = pgEnum("listing_status", ["draft", "active", "inactive"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: text("password_hash"),
  bio: text("bio"),
  whatsapp: varchar("whatsapp", { length: 20 }),
  role: roleEnum("role").notNull().default("user"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  contact: varchar("contact", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: otpTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userDevices = pgTable("user_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deviceToken: varchar("device_token", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wasteLocations = pgTable("waste_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  namaUsaha: varchar("nama_usaha", { length: 255 }).notNull(),
  namaPic: varchar("nama_pic", { length: 255 }),
  emailKontak: varchar("email_kontak", { length: 255 }),
  teleponKontak: varchar("telepon_kontak", { length: 20 }),
  alamat: text("alamat"),
  jenisSampahDiterima: text("jenis_sampah_diterima").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 80 }).notNull(),
  subcategory: varchar("subcategory", { length: 120 }),
  condition: varchar("condition", { length: 80 }).notNull(),
  mode: listingModeEnum("mode").notNull().default("sale"),
  price: integer("price"),
  location: varchar("location", { length: 160 }).notNull(),
  // Koordinat hasil geocode Mapbox. Nullable agar listing lama tetap valid;
  // form autocomplete mengisi keduanya, tapi teks manual tetap diperbolehkan.
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  handoverOptions: text("handover_options").array(),
  status: listingStatusEnum("status").notNull().default("draft"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const listingImages = pgTable("listing_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  objectKey: text("object_key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const favoriteListings = pgTable(
  "favorite_listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("favorite_listings_user_listing_unique").on(table.userId, table.listingId),
  ],
);
