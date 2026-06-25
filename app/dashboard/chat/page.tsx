import { Icon } from "@iconify/react";
import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { conversations, listings, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { Badge, PageHeader, Panel } from "../_components/SellerCenterUi";
import DashboardChatClient from "./_components/DashboardChatClient";

const buyerUsers = alias(users, "buyer_users");

export const dynamic = "force-dynamic";

export default async function SellerChatPage() {
  const user = await requireRole("user");

  const rows = await db
    .select({
      id: conversations.id,
      listingId: conversations.listingId,
      listingTitle: listings.title,
      listingSlug: listings.slug,
      listingImageUrl: sql<string | null>`(
        select image_url from listing_images
        where listing_images.listing_id = conversations.listing_id
        order by sort_order asc
        limit 1
      )`,
      buyerId: conversations.buyerId,
      buyerName: sql<string | null>`coalesce(${buyerUsers.shopName}, ${buyerUsers.fullName})`,
      sellerId: conversations.sellerId,
      sellerName: sql<string | null>`${user.shopName ?? user.fullName}`, // since user is the seller
      lastMessageAt: sql<string>`${conversations.lastMessageAt}::text`,
      lastMessageContent: sql<string | null>`(
        select content from messages
        where conversation_id = ${conversations.id}
        order by created_at desc
        limit 1
      )`,
      unreadCount: sql<number>`(
        select count(*)::int from messages
        where conversation_id = ${conversations.id}
          and sender_id != ${user.id}
          and is_read = false
      )`,
      otherUserLastSeenAt: sql<string | null>`${buyerUsers.lastSeenAt}::text`,
    })
    .from(conversations)
    .leftJoin(listings, eq(listings.id, conversations.listingId))
    .innerJoin(buyerUsers, eq(buyerUsers.id, conversations.buyerId))
    .where(eq(conversations.sellerId, user.id))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(50);

  const totalUnread = rows.reduce((sum, r) => sum + r.unreadCount, 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:messages-square"
        kicker="Chat Pembeli"
        title="Percakapan Listing"
        description="Kelola semua percakapan dari calon pembeli di satu tempat. Klik percakapan untuk membuka chat."
        meta={
          <>
            <Badge tone="success">{rows.length} percakapan</Badge>
            {totalUnread > 0 && (
              <Badge tone="danger">{totalUnread} belum dibaca</Badge>
            )}
          </>
        }
      />

      {rows.length === 0 ? (
        <Panel title="Belum ada percakapan">
          <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]">
              <Icon icon="lucide:inbox" width={26} height={26} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[var(--seller-ink)]">Belum ada calon pembeli yang menghubungi</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--seller-muted)]">
                Pastikan listing Anda aktif dan preferensi kontak disetel ke &quot;Chat Rotary&quot; agar calon pembeli bisa menghubungi Anda langsung.
              </p>
            </div>
          </div>
        </Panel>
      ) : (
        <DashboardChatClient conversations={rows} currentUserId={user.id} />
      )}
    </div>
  );
}
