import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatPrice } from "@/lib/listing-format";
import { getSellerListings } from "@/lib/listings";
import {
  EmptyState,
  ListingThumb,
  ModeBadge,
  PageHeader,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "../_components/SellerCenterUi";
import { ListingStatusButton } from "./_components/ListingStatusButton";
import { DeleteListingButton } from "./_components/DeleteListingButton";

export default async function SellerListingsPage() {
  const user = await requireRole("user");
  const sellerListings = await getSellerListings(user.id);
  const activeCount = sellerListings.filter((listing) => listing.status === "active").length;
  const draftCount = sellerListings.filter((listing) => listing.status === "draft").length;

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:list"
        kicker="Listing Saya"
        title="Semua Listing"
        description="Kelola barang bekas layak pakai yang dijual atau didonasikan lewat marketplace Rotary."
        meta={
          <>
            <span className="rounded-full bg-[var(--seller-success-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--seller-success)]">{activeCount} aktif</span>
            <span className="rounded-full bg-[var(--seller-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--seller-brand)]">{draftCount} draft</span>
          </>
        }
        actions={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Listing</PrimaryLink>}
      />

      <Panel>
        {sellerListings.length === 0 ? (
          <EmptyState
            icon="lucide:package-plus"
            title="Belum ada listing"
            description="Mulai unggah barang bekas layak pakai pertama kamu."
            action={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Buat Listing</PrimaryLink>}
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {sellerListings.map((listing) => (
              <article
                key={listing.id}
                className="grid gap-3 px-4 py-4 transition-colors hover:bg-[var(--seller-surface-2)] lg:grid-cols-[56px_minmax(0,1.4fr)_190px_auto] lg:items-center"
              >
                <ListingThumb imageUrl={listing.imageUrl} muted={listing.status === "inactive"} />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <StatusBadge status={listing.status} />
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.category} - {listing.condition}</p>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.location} - Diperbarui {listing.updatedAt.toLocaleDateString("id-ID")}</p>
                </div>

                <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 py-2">
                  <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{formatPrice(listing.price, listing.mode)}</p>
                  <p className="mt-1 text-[11px] text-[var(--seller-muted)]">{listing.status === "active" ? "Tampil publik" : listing.status === "draft" ? "Belum tampil publik" : "Disembunyikan"}</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]"
                  >
                    Edit
                  </Link>
                  {listing.status !== "active" && (
                    <ListingStatusButton
                      listingId={listing.id}
                      newStatus="active"
                      icon="lucide:send"
                      label="Terbitkan"
                      successMessage="Listing berhasil diterbitkan."
                      className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[var(--seller-accent)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]"
                    />
                  )}
                  {listing.status === "active" && (
                    <ListingStatusButton
                      listingId={listing.id}
                      newStatus="inactive"
                      icon="lucide:eye-off"
                      label="Nonaktifkan"
                      successMessage="Listing berhasil dinonaktifkan."
                      confirmMessage={`Nonaktifkan listing "${listing.title}"? Listing tidak akan tampil di marketplace sampai kamu aktifkan lagi.`}
                      className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]"
                    />
                  )}
                  {listing.status === "inactive" && (
                    <ListingStatusButton
                      listingId={listing.id}
                      newStatus="active"
                      icon="lucide:rotate-ccw"
                      label="Aktifkan"
                      successMessage="Listing berhasil diaktifkan."
                      className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]"
                    />
                  )}
                  <DeleteListingButton
                    listingId={listing.id}
                    title={listing.title}
                    className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[var(--seller-danger)] px-3 text-[12px] font-semibold text-[var(--seller-danger)] hover:bg-[#fff0f0]"
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
