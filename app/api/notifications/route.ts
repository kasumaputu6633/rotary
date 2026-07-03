import { getCurrentUser } from "@/lib/auth";
import { getChatUnreadSummary } from "@/lib/chat";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";
import { NextResponse } from "next/server";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export const dynamic = "force-dynamic";

// GET /api/notifications — daftar notifikasi terbaru + jumlah belum dibaca +
// ringkasan chat (turunan, bukan baris tabel). Ringan, di-poll untuk navbar.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { items: [], unreadCount: 0, chatUnread: { messageCount: 0, conversationCount: 0 } },
      { headers: noStoreHeaders },
    );
  }

  const [items, unreadCount, chatUnread] = await Promise.all([
    getRecentNotifications(user.id),
    getUnreadNotificationCount(user.id),
    getChatUnreadSummary(user.id),
  ]);

  return NextResponse.json({ items, unreadCount, chatUnread }, { headers: noStoreHeaders });
}
