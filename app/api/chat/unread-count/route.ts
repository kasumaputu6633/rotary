import { getCurrentUser } from "@/lib/auth";
import { getChatUnreadSummary } from "@/lib/chat";
import { NextResponse } from "next/server";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export const dynamic = "force-dynamic";

// GET /api/chat/unread-count — jumlah total pesan belum dibaca untuk user
// Ringan, di-poll untuk badge navbar
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const summary = await getChatUnreadSummary(user.id);

  return NextResponse.json(
    { count: summary.messageCount },
    {
      headers: noStoreHeaders,
    }
  );
}
