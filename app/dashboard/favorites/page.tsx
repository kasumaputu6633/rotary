import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatPrice } from "@/lib/listing-format";
import { getFavoriteListings } from "@/lib/listings";
import { EmptyState, ListingThumb, ModeBadge, PageHeader, Panel, SecondaryLink } from "../_components/SellerCenterUi";

export default async function FavoriteListingsPage() {
  const user = await requireRole("user");
  const favorites = await getFavoriteListings(user.id);

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:heart"
        kicker="Favorit"
        title="Barang Favorit"
        description="Listing yang kamu simpan dari marketplace Rotary untuk dilihat lagi sebelum menghubungi penjual."
        actions={<SecondaryLink href="/" icon="lucide:store">Buka Marketplace</SecondaryLink>}
      />

      <Panel>
        {favorites.length === 0 ? (
          <EmptyState
            icon="lucide:heart"
            title="Belum ada favorit"
            description="Simpan barang dari marketplace untuk dilihat lagi nanti."
            action={<SecondaryLink href="/" icon="lucide:store">Buka Marketplace</SecondaryLink>}
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {favorites.map((listing) => (
              <Link key={listing.id} href={`/products/${listing.slug}`} className="grid gap-3 px-4 py-4 hover:bg-[var(--seller-surface-2)] md:grid-cols-[56px_minmax(0,1fr)_160px] md:items-center">
                <ListingThumb imageUrl={listing.imageUrl} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h2>
                    <ModeBadge mode={listing.mode} />
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.category} - {listing.location}</p>
                </div>
                <p className="text-[13px] font-semibold text-[var(--seller-ink)]">{formatPrice(listing.price, listing.mode)}</p>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
