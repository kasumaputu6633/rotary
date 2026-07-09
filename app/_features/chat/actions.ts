"use server";

import { db } from "@/db";
import { conversations, complaints } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { COMPLAINT_CATEGORIES } from "@/lib/moderation-format";
import { and, eq, inArray } from "drizzle-orm";

type SubmitResult = { ok: true } | { ok: false; error: string };

// Laporkan lawan bicara dalam sebuah percakapan. Pelapor harus peserta
// percakapan tersebut, dan target dihitung sebagai peserta yang lain.
export async function submitUserComplaintAction(input: {
  conversationId: string;
  category: string;
  description: string;
}): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Silakan masuk terlebih dahulu untuk melapor." };
  }

  const category = input.category?.trim();
  if (!category || !COMPLAINT_CATEGORIES.includes(category as never)) {
    return { ok: false, error: "Kategori laporan tidak valid." };
  }

  const description = input.description?.trim() ?? "";
  if (description.length > 1000) {
    return { ok: false, error: "Deskripsi maksimal 1000 karakter." };
  }

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, input.conversationId),
    columns: { id: true, buyerId: true, sellerId: true },
  });
  if (!conversation) {
    return { ok: false, error: "Percakapan tidak ditemukan." };
  }

  // Pelapor wajib peserta percakapan; target adalah peserta lawannya.
  let targetUserId: string | null = null;
  if (conversation.buyerId === user.id) {
    targetUserId = conversation.sellerId;
  } else if (conversation.sellerId === user.id) {
    targetUserId = conversation.buyerId;
  }
  if (!targetUserId) {
    return { ok: false, error: "Anda tidak dapat melaporkan percakapan ini." };
  }

  // Cegah spam: satu laporan terbuka per pengguna per target.
  const existing = await db.query.complaints.findFirst({
    where: and(
      eq(complaints.reporterId, user.id),
      eq(complaints.targetUserId, targetUserId),
      inArray(complaints.status, ["new", "reviewing"]),
    ),
    columns: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      error: "Anda sudah melaporkan pengguna ini dan masih ditinjau.",
    };
  }

  await db.insert(complaints).values({
    reporterId: user.id,
    targetType: "user",
    targetUserId,
    category,
    description: description || null,
  });

  return { ok: true };
}
