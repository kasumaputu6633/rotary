import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  serial,
  index,
} from "drizzle-orm/pg-core";

import { users, listings, listingDeals } from "./auth";
import { wasteLocations } from "./waste";

export const complaintTargetTypeEnum = pgEnum("complaint_target_type", [
  "listing",
  "user",
  "deal",
  "waste_location",
]);

export const complaintStatusEnum = pgEnum("complaint_status", [
  "new",
  "reviewing",
  "resolved",
  "rejected",
]);

export const complaintPriorityEnum = pgEnum("complaint_priority", [
  "low",
  "medium",
  "high",
]);

export const complaints = pgTable(
  "complaints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nomor urut untuk kode tampilan human-readable (KMP-<seq>).
    seq: serial("seq").notNull(),
    // Nullable + set null: laporan tetap tersimpan untuk audit meski pelapor dihapus.
    reporterId: uuid("reporter_id").references(() => users.id, {
      onDelete: "set null",
    }),
    targetType: complaintTargetTypeEnum("target_type").notNull(),
    // Referensi polimorfik: hanya satu yang terisi sesuai targetType.
    targetListingId: uuid("target_listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    targetUserId: uuid("target_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    targetDealId: uuid("target_deal_id").references(() => listingDeals.id, {
      onDelete: "set null",
    }),
    targetWasteLocationId: uuid("target_waste_location_id").references(
      () => wasteLocations.id,
      { onDelete: "set null" },
    ),
    category: varchar("category", { length: 120 }).notNull(),
    description: text("description"),
    status: complaintStatusEnum("status").notNull().default("new"),
    priority: complaintPriorityEnum("priority").notNull().default("medium"),
    // Admin yang mengambil tanggung jawab menangani laporan.
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    handledById: uuid("handled_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    resolutionNote: text("resolution_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("complaints_status_idx").on(table.status),
    index("complaints_assignee_idx").on(table.assigneeId),
    index("complaints_target_listing_idx").on(table.targetListingId),
    index("complaints_target_waste_location_idx").on(
      table.targetWasteLocationId,
    ),
    index("complaints_reporter_idx").on(table.reporterId),
  ],
);
