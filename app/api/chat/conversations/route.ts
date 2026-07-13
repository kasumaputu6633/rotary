import { db } from "@/db";
import { conversations, listings, listingImages, users } from "@/db/schema";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

const buyers = alias(users, "buyers");
const sellers = alias(users, "sellers");
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export const dynamic = "force-dynamic";

// GET /api/chat/conversations — list semua conversations untuk user yg login
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasRole(user.role, "admin")) return NextResponse.json([], { headers: noStoreHeaders });

  const rows = await db
    .select({
      id: conversations.id,
      listingId: conversations.listingId,
      listingTitle: listings.title,
      listingSlug: listings.slug,
      listingImageUrl: sql<string | null>`(
        select image_url from listing_images
        where listing_images.listing_id = conversations.listing_id
        order by sort_order asc
        limit 1
      )`,
      buyerId: conversations.buyerId,
      buyerName: sql<string | null>`coalesce(${buyers.shopName}, ${buyers.fullName})`,
      buyerAvatarUrl: buyers.avatarUrl,
      sellerId: conversations.sellerId,
      sellerName: sql<string | null>`coalesce(${sellers.shopName}, ${sellers.fullName})`,
      sellerAvatarUrl: sellers.avatarUrl,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
      // last message preview
      lastMessageContent: sql<string | null>`(
        select content from messages
        where conversation_id = ${conversations.id}
        order by created_at desc
        limit 1
      )`,
      // unread count untuk user ini
      unreadCount: sql<number>`(
        select count(*)::int from messages
        where conversation_id = ${conversations.id}
          and sender_id != ${user.id}
          and is_read = false
      )`,
      // lastSeen lawan bicara
      otherUserLastSeenAt: sql<string | null>`(
        case when ${conversations.buyerId} = ${user.id}
          then (select last_seen_at from users where id = ${conversations.sellerId})
          else (select last_seen_at from users where id = ${conversations.buyerId})
        end
      )`,
    })
    .from(conversations)
    .leftJoin(listings, eq(listings.id, conversations.listingId))
    .innerJoin(buyers, eq(buyers.id, conversations.buyerId))
    .innerJoin(sellers, eq(sellers.id, conversations.sellerId))
    .where(
      sql`${conversations.buyerId} = ${user.id} OR ${conversations.sellerId} = ${user.id}`,
    )
    .orderBy(desc(conversations.lastMessageAt));

  return NextResponse.json(rows, {
    headers: noStoreHeaders,
  });
}

// POST /api/chat/conversations — find-or-create conversation antar pasang buyer-seller
// Satu sesi per pasang pengguna, bukan per produk
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasRole(user.role, "admin")) return NextResponse.json({ error: "Admin tidak dapat menggunakan chat" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const listingId = body?.listingId as string | undefined;
  if (!listingId) return NextResponse.json({ error: "listingId wajib diisi" }, { status: 400 });

  // Cari listing + data untuk attachment preview
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
    columns: { id: true, sellerId: true, contactPreference: true, title: true, slug: true, price: true },
  });

  if (!listing) return NextResponse.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  if (listing.sellerId === user.id) {
    return NextResponse.json({ error: "Tidak bisa chat dengan listing sendiri" }, { status: 400 });
  }

  // Ambil gambar pertama produk untuk attachment preview
  const [firstImage] = await db
    .select({ imageUrl: listingImages.imageUrl })
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder)
    .limit(1);

  const listingDetail = {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    price: listing.price,
    imageUrl: firstImage?.imageUrl ?? null,
  };

  // Update lastSeenAt
  await db
    .update(users)
    .set({ lastSeenAt: new Date() })
    .where(eq(users.id, user.id));

  // Find-or-create berdasarkan pasang buyer-seller (bukan per produk).
  // Arah penting: jika A beli dari B, itu satu sesi (A = buyer, B = seller).
  // Jika B beli dari A, itu sesi yang BERBEDA (B = buyer, A = seller).
  // Dengan demikian, percakapan akan muncul dengan benar di Seller Center masing-masing.
  const existing = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.buyerId, user.id),
      eq(conversations.sellerId, listing.sellerId),
    ),
    columns: { id: true },
  });

  if (existing) {
    return NextResponse.json({ conversationId: existing.id, listing: listingDetail });
  }

  const [newConv] = await db
    .insert(conversations)
    .values({
      listingId,  // simpan listingId pertama sebagai referensi historis
      buyerId: user.id,
      sellerId: listing.sellerId,
      contactMode: listing.contactPreference,
    })
    .returning({ id: conversations.id });

  return NextResponse.json({ conversationId: newConv.id, listing: listingDetail }, { status: 201 });
}
