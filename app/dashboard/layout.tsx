import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { unreadChatCount } from "./_data/seller-center";
import { getSellerListings } from "@/lib/listings";
import SellerCenterShell from "./_components/SellerCenterShell";

export const metadata: Metadata = {
  title: "Lapak Saya | Rotary",
  description: "Kelola listing barang bekas layak pakai di Rotary.",
};

export default async function LapakSayaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole("user");
  const sellerListings = await getSellerListings(user.id);
  const draftCount = sellerListings.filter((l) => l.status === "draft").length;
  const inactiveCount = sellerListings.filter((l) => l.status === "inactive").length;

  return (
    <SellerCenterShell
      userName={user.name ?? "Pengguna Rotary"}
      draftCount={draftCount}
      inactiveCount={inactiveCount}
      unreadChatCount={unreadChatCount}
    >
      {children}
    </SellerCenterShell>
  );
}
