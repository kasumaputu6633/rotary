import { Icon } from "@iconify/react";
import Link from "next/link";
import { requireNonAdmin } from "@/lib/auth";
import { getSellerDeals } from "@/lib/deals";
import { getSellerListings } from "@/lib/listings";
import {
  EmptyState,
  ListingThumb,
  ModeBadge,
  PageHeader,
  Panel,
  PrimaryLink,
  SecondaryLink,
  StatusBadge,
} from "../../_components/SellerCenterUi";
import { ListingLifecycleActions } from "../_components/ListingLifecycleActions";

export default async function ReservedListingsPage() {
  const user = await requireNonAdmin();
  const [reservedListings, activeDeals] = await Promise.all([
    getSellerListings(user.id, "reserved"),
    getSellerDeals(user.id, "active"),
  ]);
  const activeDealByListingId = new Map(activeDeals.map((deal) => [deal.listingId, deal]));

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:handshake"
        kicker="Listing Saya"
        title="Barang Dipesan"
        description="Listing yang sedang dalam proses kesepakatan manual dengan seorang peminat."
        actions={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Barang</PrimaryLink>}
      />

      <Panel
        title="Kesepakatan sedang berjalan"
        description="Rotary hanya menandai status listing. Harga, pembayaran, penjemputan, dan pengiriman tetap disepakati langsung antar pengguna."
      >
        {reservedListings.length === 0 ? (
          <EmptyState
            icon="lucide:handshake"
            title="Belum ada barang yang dipesan"
            description="Saat sudah sepakat dengan seorang peminat, tandai listing sebagai dipesan agar kontak baru dijeda."
            action={<SecondaryLink href="/dashboard/listings" icon="lucide:list">Buka Listing Aktif</SecondaryLink>}
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {reservedListings.map((listing) => (
              <article key={listing.id} className="grid gap-3 px-4 py-4 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center">
                <ListingThumb imageUrl={listing.imageUrl} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <StatusBadge status={listing.status} mode={listing.mode} />
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">
                    {listing.category} - {listing.location} - Ditandai {listing.reservedAt?.toLocaleDateString("id-ID") ?? listing.updatedAt.toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={activeDealByListingId.has(listing.id)
                      ? `/dashboard/deals/${activeDealByListingId.get(listing.id)?.id}`
                      : "/dashboard/deals"}
                    className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[8px] bg-[var(--seller-accent)] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
                  >
                    <Icon icon="lucide:clipboard-pen-line" width={14} height={14} aria-hidden="true" />
                    Catat Deal
                  </Link>
                  <ListingLifecycleActions
                    density="comfortable"
                    listingId={listing.id}
                    mode={listing.mode}
                    status={listing.status}
                    title={listing.title}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
