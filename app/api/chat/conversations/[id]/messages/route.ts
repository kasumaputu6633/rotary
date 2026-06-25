import { db } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, asc, eq, gt, ne, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// Helper: pastikan user adalah anggota conversation (buyer atau seller)
async function getConversationForUser(convId: string, userId: string) {
  return db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, convId),
      sql`(${conversations.buyerId} = ${userId} OR ${conversations.sellerId} = ${userId})`,
    ),
  });
}

// GET /api/chat/conversations/[id]/messages — poll messages
// Query: ?after=<messageId> untuk incremental (hanya ambil pesan baru)
export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversationForUser(id, user.id);
  if (!conv) return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 });

  // Mark messages dari lawan bicara sebagai sudah dibaca
  const otherUserId = conv.buyerId === user.id ? conv.sellerId : conv.buyerId;
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, id),
        eq(messages.senderId, otherUserId),
        eq(messages.isRead, false),
      ),
    );

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

  // Info lawan bicara (online status)
  const otherUser = await db.query.users.findFirst({
    where: eq(users.id, otherUserId),
    columns: { id: true, lastSeenAt: true, shopName: true, fullName: true, avatarUrl: true },
  });

  return NextResponse.json({
    messages: rows,
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
  });
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
  if (!content) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Pesan terlalu panjang (maks 2000 karakter)" }, { status: 400 });

  const now = new Date();

  const [newMessage] = await db
    .insert(messages)
    .values({
      conversationId: id,
      senderId: user.id,
      content,
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

  return NextResponse.json(newMessage, { status: 201 });
}
