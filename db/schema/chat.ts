import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
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
    lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    // Satu sesi chat per pasang buyer-seller (tidak peduli produknya)
    uniqueIndex("conversations_buyer_seller_unique").on(t.buyerId, t.sellerId),
    index("conversations_buyer_idx").on(t.buyerId, t.lastMessageAt),
    index("conversations_seller_idx").on(t.sellerId, t.lastMessageAt),
  ],
);

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
    // Attachment produk opsional per pesan — FK ke listings, set null jika listing dihapus
    attachmentListingId: uuid("attachment_listing_id")
      .references(() => listings.id, { onDelete: "set null" }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("messages_conv_created_idx").on(t.conversationId, t.createdAt),
    index("messages_conv_unread_idx").on(t.conversationId, t.isRead),
  ],
);
