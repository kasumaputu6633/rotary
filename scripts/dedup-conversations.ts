import { db } from "@/db";
import { sql } from "drizzle-orm";

async function deduplicateConversations() {
  console.log("🔍 Mencari duplikat conversation (buyer_id, seller_id)...");

  // 1. Temukan semua pasang yang duplikat
  const duplicates: Array<{
    buyer_id: string;
    seller_id: string;
    count: string;
    ids: string[];
  }> = await db.execute(sql`
    SELECT buyer_id, seller_id, COUNT(*)::text as count,
           array_agg(id::text ORDER BY last_message_at DESC) as ids
    FROM conversations
    GROUP BY buyer_id, seller_id
    HAVING COUNT(*) > 1
  `) as never;

  console.log(`📊 Ditemukan ${duplicates.length} pasang duplikat`);

  if (duplicates.length === 0) {
    console.log("✅ Tidak ada duplikat, langsung apply migration.");
    return;
  }

  for (const row of duplicates) {
    const ids = row.ids;
    const keepId = ids[0]; // Simpan yang paling baru (last_message_at terbesar)
    const deleteIds = ids.slice(1);

    console.log(`\n👤 buyer=${row.buyer_id} seller=${row.seller_id}`);
    console.log(`   ✅ Pertahankan: ${keepId}`);
    console.log(`   🗑️  Hapus: ${deleteIds.join(", ")}`);

    // 2. Pindahkan semua pesan dari conversation yang akan dihapus ke yang dipertahankan
    for (const deleteId of deleteIds) {
      await db.execute(sql`
        UPDATE messages SET conversation_id = ${keepId} WHERE conversation_id = ${deleteId}
      `);
      console.log(`   📨 Pesan dipindahkan dari ${deleteId} → ${keepId}`);

      // 3. Hapus conversation duplikat
      await db.execute(sql`DELETE FROM conversations WHERE id = ${deleteId}`);
      console.log(`   🗑️  Conversation ${deleteId} dihapus`);
    }

    // 4. Update last_message_at ke pesan terbaru
    await db.execute(sql`
      UPDATE conversations
      SET last_message_at = COALESCE(
        (SELECT MAX(created_at) FROM messages WHERE conversation_id = ${keepId}),
        NOW()
      )
      WHERE id = ${keepId}
    `);
  }

  console.log("\n✅ Selesai! Semua duplikat sudah dibersihkan.");
  console.log("Sekarang jalankan: bun run db:push");
}

deduplicateConversations()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  });
