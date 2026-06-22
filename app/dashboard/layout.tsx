import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getSellerListings } from "@/lib/listings";
import SellerCenterShell from "./_components/SellerCenterShell";

export const metadata: Metadata = {
  title: "Lapak Saya | Rotary",
  description: "Kelola listing barang bekas layak pakai di Rotary.",
};

const STALE_LISTING_DAYS = 14;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getCurrentTimestamp() {
  return Date.now();
}

export default async function LapakSayaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole("user");
  const sellerListings = await getSellerListings(user.id);
  const draftCount = sellerListings.filter((l) => l.status === "draft").length;
  const inactiveCount = sellerListings.filter((l) => l.status === "inactive").length;
  const activeListings = sellerListings.filter((l) => l.status === "active");
  const currentTimestamp = getCurrentTimestamp();
  const attentionCount = [
    !user.whatsapp,
    !user.avatarUrl,
    draftCount > 0,
    activeListings.some((listing) => !listing.imageUrl),
    activeListings.some((listing) => listing.latitude === null || listing.longitude === null),
    activeListings.some((listing) => !listing.handoverOptions || listing.handoverOptions.length === 0),
    activeListings.some((listing) => currentTimestamp - listing.updatedAt.getTime() > STALE_LISTING_DAYS * DAY_IN_MS),
  ].filter(Boolean).length;

  return (
    <SellerCenterShell
      userName={user.name ?? "Pengguna Rotary"}
      userAvatarUrl={user.avatarUrl}
      attentionCount={attentionCount}
      draftCount={draftCount}
      inactiveCount={inactiveCount}
    >
      {children}
    </SellerCenterShell>
  );
}
