import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversations, listingDeals, listingImages, listings, messages, users } from "@/db/schema";
import type { DealStatus } from "@/lib/deal-format";

const dealSelection = {
  id: listingDeals.id,
  listingId: listingDeals.listingId,
  sellerId: listingDeals.sellerId,
  buyerId: listingDeals.buyerId,
  stage: listingDeals.stage,
  status: listingDeals.status,
  counterpartyName: listingDeals.counterpartyName,
  counterpartyContact: listingDeals.counterpartyContact,
  agreedPrice: listingDeals.agreedPrice,
  handoverMethod: listingDeals.handoverMethod,
  handoverLocation: listingDeals.handoverLocation,
  scheduledAt: listingDeals.scheduledAt,
  sellerNote: listingDeals.sellerNote,
  createdAt: listingDeals.createdAt,
  updatedAt: listingDeals.updatedAt,
  completedAt: listingDeals.completedAt,
  cancelledAt: listingDeals.cancelledAt,
  listingTitle: listings.title,
  listingSlug: listings.slug,
  listingMode: listings.mode,
  listingStatus: listings.status,
  listingPrice: listings.price,
  listingCategory: listings.category,
  listingLocation: listings.location,
  listingImageUrl: listingImages.imageUrl,
};

export async function getSellerDeals(sellerId: string, status?: DealStatus) {
  const conditions = [eq(listingDeals.sellerId, sellerId)];
  if (status) conditions.push(eq(listingDeals.status, status));

  return db
    .select(dealSelection)
    .from(listingDeals)
    .innerJoin(listings, eq(listings.id, listingDeals.listingId))
    .leftJoin(
      listingImages,
      and(
        eq(listingImages.listingId, listings.id),
        eq(listingImages.sortOrder, 0),
      ),
    )
    .where(and(...conditions))
    .orderBy(desc(listingDeals.updatedAt), desc(listingDeals.createdAt));
}

export async function getSellerDealById(dealId: string, sellerId: string) {
  const [deal] = await db
    .select(dealSelection)
    .from(listingDeals)
    .innerJoin(listings, eq(listings.id, listingDeals.listingId))
    .leftJoin(
      listingImages,
      and(
        eq(listingImages.listingId, listings.id),
        eq(listingImages.sortOrder, 0),
      ),
    )
    .where(and(eq(listingDeals.id, dealId), eq(listingDeals.sellerId, sellerId)))
    .limit(1);

  return deal ?? null;
}

export async function getActiveSellerDealByListingId(listingId: string, sellerId: string) {
  const [deal] = await db
    .select(dealSelection)
    .from(listingDeals)
    .innerJoin(listings, eq(listings.id, listingDeals.listingId))
    .leftJoin(
      listingImages,
      and(
        eq(listingImages.listingId, listings.id),
        eq(listingImages.sortOrder, 0),
      ),
    )
    .where(and(
      eq(listingDeals.listingId, listingId),
      eq(listingDeals.sellerId, sellerId),
      eq(listingDeals.status, "active"),
    ))
    .orderBy(desc(listingDeals.createdAt))
    .limit(1);

  return deal ?? null;
}

export type SellerChatContact = {
  buyerId: string;
  name: string | null;
  avatarUrl: string | null;
  lastMessageAt: Date;
  discussedThisListing: boolean;
};

/**
 * Kontak chat penjual sebagai kandidat pembeli untuk sebuah deal. Karena satu
 * sesi chat mencakup semua produk, kontak yang pernah membahas listing ini
 * (via conversations.listingId atau pesan ber-attachmentListingId) diurutkan
 * lebih dulu — pola "who did you sell to?".
 */
export async function getSellerChatContacts(
  sellerId: string,
  listingId: string,
): Promise<SellerChatContact[]> {
  const discussed = sql<boolean>`(
    ${conversations.listingId} = ${listingId}
    OR exists (
      select 1 from ${messages}
      where ${messages.conversationId} = ${conversations.id}
        and ${messages.attachmentListingId} = ${listingId}
    )
  )`;

  return db
    .select({
      buyerId: conversations.buyerId,
      name: sql<string | null>`coalesce(${users.shopName}, ${users.fullName})`,
      avatarUrl: users.avatarUrl,
      lastMessageAt: conversations.lastMessageAt,
      discussedThisListing: discussed,
    })
    .from(conversations)
    .innerJoin(users, eq(users.id, conversations.buyerId))
    .where(eq(conversations.sellerId, sellerId))
    .orderBy(desc(discussed), desc(conversations.lastMessageAt));
}
