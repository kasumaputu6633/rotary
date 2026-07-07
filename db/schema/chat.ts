import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";
import { listings } from "./auth";
import { contactPreferenceEnum } from "./auth";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // listingId sekarang opsional — hanya sebagai referensi produk pertama yang memulai chat
    listingId: uuid("listing_id")
      .references(() => listings.id, { onDelete: "set null" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contactMode: contactPreferenceEnum("contact_mode").notNull().default("in_app"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Satu sesi chat per pasang orang, tak peduli arah. least/greatest
    // menormalkan pasangan sehingga (A,B) dan (B,A) menempati slot unik sama.
    uniqueIndex("conversations_pair_unique").on(
      sql`least(${t.buyerId}, ${t.sellerId})`,
      sql`greatest(${t.buyerId}, ${t.sellerId})`,
    ),
    index("conversations_buyer_idx").on(t.buyerId, t.lastMessageAt),
    index("conversations_seller_idx").on(t.sellerId, t.lastMessageAt),
  ],
);

import { AnyPgColumn } from "drizzle-orm/pg-core";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    attachmentListingId: uuid("attachment_listing_id")
      .references(() => listings.id, { onDelete: "set null" }),
    replyToMessageId: uuid("reply_to_message_id")
      .references((): AnyPgColumn => messages.id, { onDelete: "set null" }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("messages_conv_created_idx").on(t.conversationId, t.createdAt),
    index("messages_conv_unread_idx").on(t.conversationId, t.isRead),
  ],
);
