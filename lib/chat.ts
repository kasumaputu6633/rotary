import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";

export type ChatUnreadSummary = {
  messageCount: number;
  conversationCount: number;
};

/**
 * Ringkasan pesan belum dibaca untuk user: jumlah pesan + jumlah percakapan
 * berbeda. Diturunkan langsung dari messages.isRead — satu sumber kebenaran,
 * tidak pernah disimpan sebagai baris notifikasi.
 */
export async function getChatUnreadSummary(
  userId: string,
): Promise<ChatUnreadSummary> {
  const [row] = await db
    .select({
      messageCount: sql<number>`count(*)::int`,
      conversationCount: sql<number>`count(distinct ${messages.conversationId})::int`,
    })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        sql`(${conversations.buyerId} = ${userId} OR ${conversations.sellerId} = ${userId})`,
        sql`${messages.senderId} != ${userId}`,
        eq(messages.isRead, false),
      ),
    );
  return {
    messageCount: row?.messageCount ?? 0,
    conversationCount: row?.conversationCount ?? 0,
  };
}
