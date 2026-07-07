import { db } from "@/db";
import { conversations, messages, listings, listingImages, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, asc, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export const dynamic = "force-dynamic";

// Helper: pastikan user adalah anggota conversation (buyer atau seller)
async function getConversationForUser(convId: string, userId: string) {
  const result = await db
    .select({
      id: conversations.id,
      listingId: conversations.listingId,
      buyerId: conversations.buyerId,
      sellerId: conversations.sellerId,
      lastMessageAt: conversations.lastMessageAt,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, convId),
        sql`(${conversations.buyerId} = ${userId} OR ${conversations.sellerId} = ${userId})`,
      )
    )
    .limit(1);

  return result[0];
}

// GET /api/chat/conversations/[id]/messages — poll messages
export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversationForUser(id, user.id);
  if (!conv) return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 });

  // Mark messages dari lawan bicara sebagai sudah dibaca
  const otherUserId = conv.buyerId === user.id ? conv.sellerId : conv.buyerId;
  const readMessages = await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, id),
        eq(messages.senderId, otherUserId),
        eq(messages.isRead, false),
      ),
    )
    .returning({ id: messages.id });

  // Ambil messages (incremental jika ?after= ada)
  const afterParam = req.nextUrl.searchParams.get("after");
  let afterCreatedAt: Date | null = null;

  if (afterParam) {
    const afterMsg = await db.query.messages.findFirst({
      where: and(eq(messages.id, afterParam), eq(messages.conversationId, id)),
      columns: { createdAt: true },
    });
    afterCreatedAt = afterMsg?.createdAt ?? null;
  }

  const rows = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      attachmentListingId: messages.attachmentListingId,
      replyToMessageId: messages.replyToMessageId,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      afterCreatedAt && afterParam
        ? and(
            eq(messages.conversationId, id),
            gt(messages.createdAt, afterCreatedAt),
            ne(messages.id, afterParam)
          )
        : eq(messages.conversationId, id),
    )
    .orderBy(asc(messages.createdAt))
    .limit(100);

  const readReceiptRows = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, id),
        eq(messages.senderId, user.id),
        eq(messages.isRead, true),
      ),
    )
    .orderBy(desc(messages.createdAt))
    .limit(100);

  // Batch-fetch reply messages first so we know if they have attachments
  const replyIds = [...new Set(
    rows.map((r) => r.replyToMessageId).filter((x): x is string => x !== null)
  )];

  const replyMap = new Map<string, { id: string; content: string; senderId: string; attachmentListingId: string | null }>();
  if (replyIds.length > 0) {
    const repliedMsgs = await db
      .select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        attachmentListingId: messages.attachmentListingId,
      })
      .from(messages)
      .where(inArray(messages.id, replyIds));
    for (const r of repliedMsgs) {
      replyMap.set(r.id, r);
    }
  }

  // Batch-fetch attachment details untuk semua pesan dan reply yang punya attachment
  const attachmentIds = [...new Set([
    ...rows.map((r) => r.attachmentListingId),
    ...Array.from(replyMap.values()).map((r) => r.attachmentListingId)
  ].filter((x): x is string => x !== null))];

  const attachmentMap = new Map<string, {
    id: string; title: string; slug: string; price: number | null; imageUrl: string | null;
  }>();

  if (attachmentIds.length > 0) {
    const attachmentListings = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        price: listings.price,
        imageUrl: sql<string | null>`(
          select image_url from listing_images
          where listing_images.listing_id = listings.id
          order by sort_order asc
          limit 1
        )`,
      })
      .from(listings)
      .where(inArray(listings.id, attachmentIds));

    for (const al of attachmentListings) {
      attachmentMap.set(al.id, al);
    }
  }

  // Gabungkan attachment & reply data ke tiap message
  const messagesWithAttachments = rows.map((msg) => {
    const replyData = msg.replyToMessageId ? replyMap.get(msg.replyToMessageId) : null;
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      attachment: msg.attachmentListingId ? (attachmentMap.get(msg.attachmentListingId) ?? null) : null,
      replyToMessage: replyData ? {
        id: replyData.id,
        content: replyData.content,
        senderId: replyData.senderId,
        attachment: replyData.attachmentListingId ? (attachmentMap.get(replyData.attachmentListingId) ?? null) : null,
      } : null,
    };
  });

  // Info lawan bicara (online status)
  const otherUser = await db.query.users.findFirst({
    where: eq(users.id, otherUserId),
    columns: { id: true, lastSeenAt: true, shopName: true, fullName: true, avatarUrl: true },
  });

  return NextResponse.json({
    messages: messagesWithAttachments,
    readMessagesCount: readMessages.length,
    readMessageIds: readReceiptRows.map((row) => row.id),
    conversation: {
      id: conv.id,
      listingId: conv.listingId,
      buyerId: conv.buyerId,
      sellerId: conv.sellerId,
      lastMessageAt: conv.lastMessageAt,
    },
    otherUser: otherUser
      ? {
          id: otherUser.id,
          name: otherUser.shopName ?? otherUser.fullName ?? "Pengguna Rotary",
          avatarUrl: otherUser.avatarUrl,
          lastSeenAt: otherUser.lastSeenAt,
        }
      : null,
  }, { headers: noStoreHeaders });
}

// POST /api/chat/conversations/[id]/messages — kirim pesan
export async function POST(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversationForUser(id, user.id);
  if (!conv) return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const attachmentListingId = typeof body?.attachmentListingId === "string" ? body.attachmentListingId : null;
  const replyToMessageId = typeof body?.replyToMessageId === "string" ? body.replyToMessageId : null;

  // Boleh kirim attachment saja tanpa teks
  if (!content && !attachmentListingId) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Pesan terlalu panjang (maks 2000 karakter)" }, { status: 400 });
  }

  // Validasi attachmentListingId jika ada
  if (attachmentListingId) {
    const listingExists = await db.query.listings.findFirst({
      where: eq(listings.id, attachmentListingId),
      columns: { id: true },
    });
    if (!listingExists) {
      return NextResponse.json({ error: "Listing attachment tidak ditemukan" }, { status: 400 });
    }
  }

  const now = new Date();

  const [newMessage] = await db
    .insert(messages)
    .values({
      conversationId: id,
      senderId: user.id,
      content: content || " ", // simpan spasi jika pesan kosong (attachment-only)
      attachmentListingId: attachmentListingId ?? undefined,
      replyToMessageId: replyToMessageId ?? undefined,
      createdAt: now,
    })
    .returning();

  // Update lastMessageAt di conversation
  await db
    .update(conversations)
    .set({ lastMessageAt: now })
    .where(eq(conversations.id, id));

  // Update lastSeenAt
  await db
    .update(users)
    .set({ lastSeenAt: now })
    .where(eq(users.id, user.id));

  // Ambil attachment detail jika ada
  let attachment = null;
  if (newMessage.attachmentListingId) {
    const al = await db.query.listings.findFirst({
      where: eq(listings.id, newMessage.attachmentListingId),
      columns: { id: true, title: true, slug: true, price: true },
    });
    if (al) {
      const [img] = await db
        .select({ imageUrl: listingImages.imageUrl })
        .from(listingImages)
        .where(eq(listingImages.listingId, al.id))
        .orderBy(listingImages.sortOrder)
        .limit(1);
      attachment = { ...al, imageUrl: img?.imageUrl ?? null };
    }
  }

  return NextResponse.json({
    id: newMessage.id,
    conversationId: newMessage.conversationId,
    senderId: newMessage.senderId,
    content: newMessage.content,
    isRead: newMessage.isRead,
    createdAt: newMessage.createdAt,
    attachment,
    // Note: untuk optimasi front-end bisa saja replyToMessage dikirim utuh, tapi saat ini kita tidak query ulang saat send, 
    // karena ThreadView sudah punya data pesannya di client state
    replyToMessage: replyToMessageId ? { id: replyToMessageId } : null,
  }, { status: 201 });
}

