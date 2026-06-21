import { Icon } from "@iconify/react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatPrice } from "@/lib/listing-format";
import { getSellerListings, getSellerListingStats } from "@/lib/listings";
import { unreadChatCount } from "./_data/seller-center";
import {
  Badge,
  EmptyState,
  IconButton,
  ListingStatsPills,
  ListingThumb,
  MiniMetric,
  ModeBadge,
  PageHeader,
  Panel,
  PrimaryLink,
  SecondaryLink,
} from "./_components/SellerCenterUi";

const listingTips = [
  "Foto barang dari beberapa sisi.",
  "Tulis kondisi apa adanya.",
  "Jelaskan titik temu atau penjemputan.",
];

export default async function LapakSayaPage() {
  const user = await requireRole("user");
  const [sellerListings, listingStats] = await Promise.all([
    getSellerListings(user.id),
    getSellerListingStats(user.id),
  ]);
  const activeListings = sellerListings.filter((listing) => listing.status === "active");
  const draftListings = sellerListings.filter((listing) => listing.status === "draft");
  const inactiveListings = sellerListings.filter((listing) => listing.status === "inactive");
  const latestActiveListings = activeListings.slice(0, 4);
  const totals = Object.values(listingStats).reduce(
    (acc, stats) => ({
      viewCount: acc.viewCount + stats.viewCount,
      favoriteCount: acc.favoriteCount + stats.favoriteCount,
    }),
    { viewCount: 0, favoriteCount: 0 },
  );

  const todoItems = [
    ...(unreadChatCount > 0
      ? [{
          title: "Balas chat calon pembeli",
          description: `${unreadChatCount} percakapan menunggu respon supaya calon pembeli tidak pindah ke listing lain.`,
          icon: "lucide:messages-square",
          href: "/dashboard/chat",
          action: "Buka chat",
        }]
      : []),
    ...(draftListings.length > 0
      ? [{
          title: "Lengkapi draft listing",
          description: `${draftListings.length} barang belum punya detail lengkap dan belum tampil di marketplace.`,
          icon: "lucide:file-pen-line",
          href: "/dashboard/listings/drafts",
          action: "Lihat draft",
        }]
      : []),
    {
      title: "Cek listing aktif",
      description: "Pastikan harga, lokasi, dan opsi serah terima masih sesuai.",
      icon: "lucide:store",
      href: "/dashboard/listings",
      action: "Kelola listing",
    },
  ];

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:store"
        kicker="Lapak Saya"
        title="Beranda Lapak"
        description="Kelola barang bekas layak pakai, percakapan calon pembeli, dan draft listing dari satu meja kerja."
        meta={
          <>
            <Badge tone="brand">Listing langsung tampil</Badge>
            <Badge tone="accent">Manual deal antar pengguna</Badge>
          </>
        }
        actions={
          <>
            <SecondaryLink href="/dashboard/listings" icon="lucide:list">Semua Listing</SecondaryLink>
            <PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Barang</PrimaryLink>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniMetric icon="lucide:package-check" label="Aktif" value={activeListings.length} />
            <MiniMetric icon="lucide:eye" label="Total dilihat" value={totals.viewCount} />
            <MiniMetric icon="lucide:heart" label="Disimpan" value={totals.favoriteCount} />
            <MiniMetric icon="lucide:file-pen-line" label="Draft" value={draftListings.length} />
          </div>

          <Panel
            title="Perlu ditangani"
            description="Urutan kerja yang paling penting supaya lapak tetap responsif."
            actions={<Badge tone="accent">{todoItems.length} tugas</Badge>}
          >
            <div className="divide-y divide-[var(--seller-rule)]">
              {todoItems.map((item) => (
                <Link key={item.title} href={item.href} className="group grid gap-3 px-4 py-4 transition-colors hover:bg-[var(--seller-surface-2)] sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]">
                    <Icon icon={item.icon} width={20} height={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-[var(--seller-ink)]">{item.title}</span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-[var(--seller-muted)]">{item.description}</span>
                  </span>
                  <span className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-semibold text-[var(--seller-brand)]">
                    {item.action}
                    <Icon icon="lucide:arrow-right" width={14} height={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel
            title="Listing yang sedang tayang"
            description="Pantau listing aktif dan pastikan detailnya masih sesuai."
            actions={<IconButton href="/dashboard/listings" icon="lucide:arrow-right">Lihat semua</IconButton>}
          >
            {latestActiveListings.length > 0 ? (
              <div className="divide-y divide-[var(--seller-rule)]">
                {latestActiveListings.map((listing) => (
                  <article key={listing.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[56px_minmax(0,1fr)_230px_auto]">
                    <ListingThumb imageUrl={listing.imageUrl} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">{listing.title}</h3>
                        <ModeBadge mode={listing.mode} />
                      </div>
                      <p className="mt-1 truncate text-[12px] text-[var(--seller-muted)]">{listing.category} - {listing.location} - {listing.updatedAt.toLocaleDateString("id-ID")}</p>
                    </div>
                    <ListingStatsPills
                      className="sm:col-start-2 sm:row-start-2 sm:max-w-[230px] lg:col-auto lg:row-auto lg:max-w-none"
                      viewCount={listingStats[listing.id]?.viewCount ?? 0}
                      favoriteCount={listingStats[listing.id]?.favoriteCount ?? 0}
                    />
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="inline-flex h-8 items-center rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)] sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:self-center lg:col-auto lg:row-auto">
                      Edit
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="lucide:package-plus"
                title="Belum ada listing aktif"
                description="Terbitkan barang bekas layak pakai agar langsung muncul di marketplace Rotary."
                action={<PrimaryLink href="/dashboard/listings/new" icon="lucide:package-plus">Tambah Barang</PrimaryLink>}
              />
            )}
          </Panel>
        </div>

        <aside className="grid content-start gap-4">
          <Panel title="Komposisi lapak" description="Kesehatan listing saat ini.">
            <div className="grid gap-2 p-4">
              <div className="flex items-center justify-between rounded-[8px] bg-[var(--seller-success-soft)] px-3 py-2">
                <span className="text-[12px] font-semibold text-[var(--seller-success)]">Aktif</span>
                <span className="text-[18px] font-semibold text-[var(--seller-ink)]">{activeListings.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-[8px] bg-[var(--seller-accent-soft)] px-3 py-2">
                <span className="text-[12px] font-semibold text-[var(--seller-brand)]">Draft</span>
                <span className="text-[18px] font-semibold text-[var(--seller-ink)]">{draftListings.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-[8px] bg-[var(--seller-surface-2)] px-3 py-2">
                <span className="text-[12px] font-semibold text-[var(--seller-muted)]">Nonaktif</span>
                <span className="text-[18px] font-semibold text-[var(--seller-ink)]">{inactiveListings.length}</span>
              </div>
            </div>
          </Panel>

          <Panel
            title="Draft cepat"
            actions={<IconButton href="/dashboard/listings/drafts" icon="lucide:arrow-right">Buka</IconButton>}
          >
            {draftListings.length > 0 ? (
              <div className="divide-y divide-[var(--seller-rule)]">
                {draftListings.slice(0, 3).map((listing) => (
                  <div key={listing.id} className="px-4 py-3">
                    <p className="truncate text-[13px] font-semibold text-[var(--seller-ink)]">{listing.title}</p>
                    <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{listing.category} - {formatPrice(listing.price, listing.mode)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 text-[12px] leading-relaxed text-[var(--seller-muted)]">Tidak ada draft yang menunggu dilengkapi.</div>
            )}
          </Panel>

          <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] p-4">
            <h2 className="text-[15px] font-semibold text-[var(--seller-brand)]">Checklist sebelum tayang</h2>
            <div className="mt-3 grid gap-2">
              {listingTips.map((tip) => (
                <div key={tip} className="flex gap-2 text-[12px] leading-relaxed text-[var(--seller-muted)]">
                  <Icon icon="lucide:check-circle-2" width={15} height={15} className="mt-0.5 shrink-0 text-[var(--seller-success)]" aria-hidden="true" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
