import { db } from "@/db";
import { conversations, messages, listings, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

const buyers = alias(users, "buyers");
const sellers = alias(users, "sellers");

// GET /api/chat/conversations — list semua conversations untuk user yg login
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: conversations.id,
      listingId: conversations.listingId,
      listingTitle: listings.title,
      listingSlug: listings.slug,
      listingImageUrl: sql<string | null>`(
        select image_url from listing_images
        where listing_id = ${conversations.listingId}
          and sort_order = 0
        limit 1
      )`,
      buyerId: conversations.buyerId,
      buyerName: sql<string | null>`coalesce(${buyers.shopName}, ${buyers.fullName})`,
      sellerId: conversations.sellerId,
      sellerName: sql<string | null>`coalesce(${sellers.shopName}, ${sellers.fullName})`,
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
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .innerJoin(buyers, eq(buyers.id, conversations.buyerId))
    .innerJoin(sellers, eq(sellers.id, conversations.sellerId))
    .where(
      sql`${conversations.buyerId} = ${user.id} OR ${conversations.sellerId} = ${user.id}`,
    )
    .orderBy(desc(conversations.lastMessageAt));

  return NextResponse.json(rows, {
    headers: {
      "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
    },
  });
}

// POST /api/chat/conversations — find-or-create conversation
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const listingId = body?.listingId as string | undefined;
  if (!listingId) return NextResponse.json({ error: "listingId wajib diisi" }, { status: 400 });

  // Cari listing
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
    columns: { id: true, sellerId: true, contactPreference: true },
  });

  if (!listing) return NextResponse.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  if (listing.sellerId === user.id) {
    return NextResponse.json({ error: "Tidak bisa chat dengan listing sendiri" }, { status: 400 });
  }

  // Update lastSeenAt
  await db
    .update(users)
    .set({ lastSeenAt: new Date() })
    .where(eq(users.id, user.id));

  // Find-or-create
  const existing = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.listingId, listingId),
      eq(conversations.buyerId, user.id),
    ),
    columns: { id: true },
  });

  if (existing) {
    return NextResponse.json({ conversationId: existing.id });
  }

  const [newConv] = await db
    .insert(conversations)
    .values({
      listingId,
      buyerId: user.id,
      sellerId: listing.sellerId,
      contactMode: listing.contactPreference,
    })
    .returning({ id: conversations.id });

  return NextResponse.json({ conversationId: newConv.id }, { status: 201 });
}
