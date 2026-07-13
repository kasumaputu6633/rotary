import { requireNonAdmin } from "@/lib/auth";
import { formatListingStatus } from "@/lib/listing-format";
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

export default async function CompletedListingsPage() {
  const user = await requireNonAdmin();
  const completedListings = await getSellerListings(user.id, "completed");

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:circle-check-big"
        kicker="Listing Saya"
        title="Listing Selesai"
        description="Riwayat barang yang sudah terjual atau berhasil disalurkan melalui kesepakatan antar pengguna."
        actions={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Barang</PrimaryLink>}
      />

      <Panel
        title="Barang selesai disalurkan"
        description="Status selesai hanya menutup listing dari marketplace dan bukan bukti transaksi atau pembayaran dari Rotary."
      >
        {completedListings.length === 0 ? (
          <EmptyState
            icon="lucide:circle-check-big"
            title="Belum ada listing selesai"
            description="Barang yang sudah terjual atau tersalurkan akan tersimpan di sini."
            action={<SecondaryLink href="/dashboard/listings" icon="lucide:list">Buka Semua Listing</SecondaryLink>}
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {completedListings.map((listing) => (
              <article key={listing.id} className="grid gap-3 px-4 py-4 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center">
                <ListingThumb imageUrl={listing.imageUrl} muted />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <StatusBadge status={listing.status} mode={listing.mode} />
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">
                    {formatListingStatus(listing.status, listing.mode)} {listing.completedAt?.toLocaleDateString("id-ID") ?? listing.updatedAt.toLocaleDateString("id-ID")} - {listing.category}
                  </p>
                </div>
                <ListingLifecycleActions
                  density="comfortable"
                  listingId={listing.id}
                  mode={listing.mode}
                  status={listing.status}
                  title={listing.title}
                />
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
