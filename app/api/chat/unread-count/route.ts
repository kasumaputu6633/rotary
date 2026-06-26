import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/chat/unread-count — jumlah total pesan belum dibaca untuk user
// Ringan, di-poll setiap 30 detik untuk badge navbar
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const [result] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        sql`(${conversations.buyerId} = ${user.id} OR ${conversations.sellerId} = ${user.id})`,
        sql`${messages.senderId} != ${user.id}`,
        eq(messages.isRead, false),
      ),
    );

  return NextResponse.json(
    { count: result?.count ?? 0 },
    {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
      },
    }
  );
}
