import { Icon } from "@iconify/react";
import Link from "next/link";
import ProductCard from "@/app/_components/ProductCard";
import { requireNonAdmin } from "@/lib/auth";
import { getFavoriteListings } from "@/lib/listings";
import { AccountPageHeader, AccountPanel, AccountSecondaryLink } from "../_components/AccountUi";

export default async function AccountFavoritesPage() {
  const user = await requireNonAdmin();
  const favorites = await getFavoriteListings(user.id);

  return (
    <div className="grid gap-5">
      <AccountPageHeader
        icon="lucide:heart"
        title="Barang Favorit"
        description="Kumpulan barang yang kamu simpan saat menjelajahi marketplace Rotary."
        actions={
          <AccountSecondaryLink href="/products" icon="lucide:store">
            Buka Marketplace
          </AccountSecondaryLink>
        }
      />

      <AccountPanel>
        {favorites.length === 0 ? (
          <div className="grid min-h-[330px] place-items-center px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[10px] bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
                <Icon icon="lucide:heart" width={25} height={25} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold">Belum ada barang favorit</h2>
              <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-[var(--seller-muted)]">
                Tekan ikon hati pada barang yang ingin kamu simpan dan lihat kembali nanti.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white transition hover:brightness-110"
              >
                <Icon icon="lucide:search" width={15} height={15} aria-hidden="true" />
                Jelajahi Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--seller-rule)] pb-4">
              <p className="text-[12px] text-[var(--seller-muted)]">
                <strong className="font-semibold text-[var(--seller-ink)]">{favorites.length}</strong> barang tersimpan
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
              {favorites.map((listing) => (
                <ProductCard key={listing.id} product={listing} />
              ))}
            </div>
          </div>
        )}
      </AccountPanel>
    </div>
  );
}
