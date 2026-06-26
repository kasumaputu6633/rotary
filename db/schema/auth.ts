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
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const otpTypeEnum = pgEnum("otp_type", [
  "register",
  "forgot_password",
  "login_verify",
  "phone_verify",
  "email_verify",
  "two_factor",
]);
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const twoFactorMethodEnum = pgEnum("two_factor_method", ["email", "whatsapp"]);
export const listingModeEnum = pgEnum("listing_mode", ["sale", "donation"]);
export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "active",
  "reserved",
  "completed",
  "inactive",
]);
export const dealStageEnum = pgEnum("deal_stage", [
  "negotiating",
  "agreed",
  "handover_scheduled",
]);
export const dealStatusEnum = pgEnum("deal_status", [
  "active",
  "completed",
  "cancelled",
]);
export const contactPreferenceEnum = pgEnum("contact_preference", ["in_app", "whatsapp"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }),
    shopName: varchar("shop_name", { length: 80 }),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).unique(),
    passwordHash: text("password_hash"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    avatarObjectKey: text("avatar_object_key"),
    role: roleEnum("role").notNull().default("user"),
    isVerified: boolean("is_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at"),
    phoneVerifiedAt: timestamp("phone_verified_at"),
    whatsappContactEnabled: boolean("whatsapp_contact_enabled").notNull().default(false),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    twoFactorMethod: twoFactorMethodEnum("two_factor_method").notNull().default("email"),
    lastSeenAt: timestamp("last_seen_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contact: varchar("contact", { length: 255 }).notNull(),
    codeHash: varchar("code_hash", { length: 64 }).notNull(),
    type: otpTypeEnum("type").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("otp_codes_contact_type_created_idx").on(table.contact, table.type, table.createdAt),
    check("otp_codes_attempts_check", sql`${table.attempts} >= 0 AND ${table.attempts} <= 5`),
  ],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("password_reset_tokens_user_id_idx").on(table.userId),
  ],
);

export const userDevices = pgTable(
  "user_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceTokenHash: varchar("device_token_hash", { length: 64 }).notNull().unique(),
    deviceName: varchar("device_name", { length: 120 }).notNull(),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 64 }),
    lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_devices_user_id_idx").on(table.userId),
    index("user_devices_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);

export const accountSessions = pgTable(
  "account_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    deviceId: uuid("device_id")
      .references(() => userDevices.id, { onDelete: "set null" }),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 64 }),
    lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("account_sessions_user_id_idx").on(table.userId),
    index("account_sessions_device_id_idx").on(table.deviceId),
    index("account_sessions_active_user_idx")
      .on(table.userId, table.expiresAt)
      .where(sql`${table.revokedAt} IS NULL`),
  ],
);

export const loginActivities = pgTable(
  "login_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    event: varchar("event", { length: 40 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("success"),
    method: varchar("method", { length: 24 }),
    deviceName: varchar("device_name", { length: 120 }),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("login_activities_user_created_idx").on(table.userId, table.createdAt),
    check("login_activities_status_check", sql`${table.status} IN ('success', 'failed', 'info')`),
  ],
);

export const userRecoveryCodes = pgTable(
  "user_recovery_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: varchar("code_hash", { length: 64 }).notNull().unique(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_recovery_codes_user_id_idx").on(table.userId),
  ],
);


export const listings = pgTable(
  "listings",
  {
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
    location: varchar("location", { length: 255 }).notNull(),
    // Koordinat hasil geocode Mapbox. Nullable agar listing lama tetap valid;
    // form autocomplete mengisi keduanya, tapi teks manual tetap diperbolehkan.
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    handoverOptions: text("handover_options").array(),
    status: listingStatusEnum("status").notNull().default("draft"),
    contactPreference: contactPreferenceEnum("contact_preference").notNull().default("in_app"),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    publishedAt: timestamp("published_at"),
    reservedAt: timestamp("reserved_at"),
    completedAt: timestamp("completed_at"),
    verificationSentAt: timestamp("verification_sent_at"),
  },
  (table) => [
    index("listings_seller_id_idx").on(table.sellerId),
  ],
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    objectKey: text("object_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("listing_images_listing_id_idx").on(table.listingId),
  ],
);

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
    index("favorite_listings_listing_id_idx").on(table.listingId),
    uniqueIndex("favorite_listings_user_listing_unique").on(table.userId, table.listingId),
  ],
);

export const listingDeals = pgTable(
  "listing_deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stage: dealStageEnum("stage").notNull().default("negotiating"),
    status: dealStatusEnum("status").notNull().default("active"),
    counterpartyName: varchar("counterparty_name", { length: 120 }),
    counterpartyContact: varchar("counterparty_contact", { length: 80 }),
    agreedPrice: integer("agreed_price"),
    handoverMethod: varchar("handover_method", { length: 80 }),
    handoverLocation: text("handover_location"),
    scheduledAt: timestamp("scheduled_at"),
    sellerNote: text("seller_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
  },
  (table) => [
    index("listing_deals_listing_id_idx").on(table.listingId),
    index("listing_deals_seller_status_idx").on(table.sellerId, table.status),
    uniqueIndex("listing_deals_one_active_per_listing_idx")
      .on(table.listingId)
      .where(sql`${table.status} = 'active'`),
  ],
);
