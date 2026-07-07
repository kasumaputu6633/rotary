import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { generateRenewToken } from "@/lib/listings";
import { createNotificationIfEnabled } from "@/lib/notifications";
import { sendWhatsAppText } from "@/lib/waha";
import { and, eq, lte, isNull, sql } from "drizzle-orm";

let lastCronRunTime = 0;

export async function runDeactivateListingsCron(force = false) {
  const nowMs = Date.now();
  // Cooldown 10 detik di development agar mudah ditest, 1 jam di production
  const cooldownMs = process.env.NODE_ENV === "development" ? 10 * 1000 : 60 * 60 * 1000;

  if (!force && (nowMs - lastCronRunTime < cooldownMs)) {
    return {
      notificationsSent: [] as string[],
      deactivatedListings: [] as string[],
      errors: ["Skipped: Cooldown active"],
    };
  }

  if (!force) {
    lastCronRunTime = nowMs;
  }

  const results = {
    notificationsSent: [] as string[],
    deactivatedListings: [] as string[],
    errors: [] as string[],
  };

  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // --- BAGIAN A: Kirim WhatsApp Pengingat (Active > 30 hari & belum dikirimi verifikasi) ---
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const pendingVerification = await db
    .select({
      id: listings.id,
      title: listings.title,
      status: listings.status,
      sellerId: listings.sellerId,
      sellerName: sql<string | null>`coalesce(${users.shopName}, ${users.fullName})`,
      sellerPhone: users.phone,
    })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.sellerId))
    .where(
      and(
        eq(listings.status, "active"),
        lte(listings.updatedAt, thirtyDaysAgo),
        isNull(listings.verificationSentAt)
      )
    );

  for (const listing of pendingVerification) {
    if (!listing.sellerPhone) {
      results.errors.push(`Listing ID ${listing.id}: Penjual tidak memiliki nomor telepon.`);
      continue;
    }

    try {
      const token = generateRenewToken(listing.id);
      const renewUrl = `${appUrl}/listings/${listing.id}/renew?token=${token}`;
      const name = listing.sellerName || "Pengguna";

      const text = [
        `Halo ${name},`,
        "",
        `Listing barang bekas Anda yang berjudul "*${listing.title}*" telah aktif selama 30 hari. Apakah barang ini masih tersedia?`,
        "",
        `Mohon konfirmasi status barang Anda dengan mengeklik tautan berikut (tanpa perlu masuk akun):`,
        renewUrl,
        "",
        `Jika tidak ada konfirmasi dalam waktu 48 jam, listing Anda akan otomatis dinonaktifkan sementara dari marketplace. Anda dapat mengaktifkannya kembali kapan saja.`,
        "",
        `Salam,`,
        `Tim Rotary`
      ].join("\n");

      await sendWhatsAppText(listing.sellerPhone, text);

      // Update verificationSentAt
      await db
        .update(listings)
        .set({
          verificationSentAt: now,
        })
        .where(eq(listings.id, listing.id));

      results.notificationsSent.push(listing.id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Listing ID ${listing.id}: Gagal mengirim WA. Error: ${errorMsg}`);
    }
  }

  // --- BAGIAN B: Otomatis Nonaktifkan (Dikirim verifikasi > 48 jam yang lalu) ---
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const pendingDeactivation = await db
    .select({
      id: listings.id,
      title: listings.title,
      status: listings.status,
      sellerId: listings.sellerId,
      sellerName: sql<string | null>`coalesce(${users.shopName}, ${users.fullName})`,
      sellerPhone: users.phone,
    })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.sellerId))
    .where(
      and(
        eq(listings.status, "active"),
        lte(listings.verificationSentAt, fortyEightHoursAgo)
      )
    );

  for (const listing of pendingDeactivation) {
    try {
      // Nonaktifkan listing
      await db
        .update(listings)
        .set({
          status: "inactive",
          verificationSentAt: null,
          updatedAt: now,
        })
        .where(eq(listings.id, listing.id));

      results.deactivatedListings.push(listing.id);

      // Notifikasi in-app dikirim ke penjual (termasuk yang tanpa WA),
      // mencerminkan pesan WhatsApp penonaktifan di bawah. Di-gate preferensi
      // "aktivitas listing" — penjual boleh mematikannya.
      await createNotificationIfEnabled(
        {
          recipientId: listing.sellerId,
          type: "listing_deactivated",
          title: "Listing dinonaktifkan otomatis",
          body: `"${listing.title}" dinonaktifkan sementara karena belum ada konfirmasi ketersediaan. Aktifkan kembali kapan saja dari Seller Center.`,
          href: "/dashboard/listings/inactive",
        },
        "listingActivity",
      );

      // Kirim WhatsApp pemberitahuan penonaktifan jika ada nomor telepon
      if (listing.sellerPhone) {
        const name = listing.sellerName || "Pengguna";
        const deactivationText = [
          `Halo ${name},`,
          "",
          `Karena belum ada konfirmasi, listing Anda "*${listing.title}*" saat ini dinonaktifkan sementara dari marketplace Rotary agar pembeli hanya melihat produk yang masih tersedia.`,
          "",
          `Anda dapat mengaktifkan kembali listing ini dengan mudah kapan saja secara manual melalui Seller Center di Dashboard Rotary Anda.`,
          "",
          `Salam,`,
          `Tim Rotary`
        ].join("\n");

        await sendWhatsAppText(listing.sellerPhone, deactivationText);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Listing ID ${listing.id} (Deactivation): Error: ${errorMsg}`);
    }
  }

  return results;
}
