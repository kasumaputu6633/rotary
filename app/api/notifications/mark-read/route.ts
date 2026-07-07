import { getCurrentUser } from "@/lib/auth";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/notifications/mark-read — tandai satu ({ id }) atau semua ({ all: true }).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body?.all === true) {
    await markAllNotificationsRead(user.id);
    return NextResponse.json({ ok: true });
  }

  if (typeof body?.id === "string") {
    await markNotificationRead(user.id, body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
