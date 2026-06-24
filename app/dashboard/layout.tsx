import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getSellerListings } from "@/lib/listings";
import { getProfileCompletion, resolveDisplayName } from "@/lib/profile";
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
  const reservedCount = sellerListings.filter((l) => l.status === "reserved").length;
  const completedCount = sellerListings.filter((l) => l.status === "completed").length;
  const inactiveCount = sellerListings.filter((l) => l.status === "inactive").length;
  const activeListings = sellerListings.filter((l) => l.status === "active");
  const profileCompletion = getProfileCompletion(user);
  const publicProfileMissingCount = profileCompletion.checklist.filter((item) => item.publicNow && !item.complete).length;
  const currentTimestamp = getCurrentTimestamp();
  const attentionCount = [
    publicProfileMissingCount > 0,
    draftCount > 0,
    reservedCount > 0,
    activeListings.some((listing) => !listing.imageUrl),
    activeListings.some((listing) => listing.latitude === null || listing.longitude === null),
    activeListings.some((listing) => !listing.handoverOptions || listing.handoverOptions.length === 0),
    activeListings.some((listing) => currentTimestamp - listing.updatedAt.getTime() > STALE_LISTING_DAYS * DAY_IN_MS),
  ].filter(Boolean).length;

  return (
    <SellerCenterShell
      userName={resolveDisplayName(user)}
      userAvatarUrl={user.avatarUrl}
      attentionCount={attentionCount}
      completedCount={completedCount}
      draftCount={draftCount}
      inactiveCount={inactiveCount}
      profileMissingCount={profileCompletion.missingCount}
      reservedCount={reservedCount}
      isPhoneVerified={Boolean(user.phone)}
    >
      {children}
    </SellerCenterShell>
  );
}
