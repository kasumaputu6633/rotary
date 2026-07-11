import { Icon } from "@iconify/react";
import Link from "next/link";
import { requireNonAdmin } from "@/lib/auth";
import {
  formatDealSchedule,
  formatDealStatus,
  formatHandoverMethod,
} from "@/lib/deal-format";
import { getSellerDeals } from "@/lib/deals";
import { formatPrice } from "@/lib/listing-format";
import {
  Badge,
  DealStageBadge,
  EmptyState,
  ListingThumb,
  MiniMetric,
  ModeBadge,
  PageHeader,
  Panel,
  PrimaryLink,
} from "../_components/SellerCenterUi";

export default async function SellerDealsPage() {
  const user = await requireNonAdmin();
  const deals = await getSellerDeals(user.id);
  const activeDeals = deals.filter((deal) => deal.status === "active");
  const completedDeals = deals.filter((deal) => deal.status === "completed");
  const cancelledDeals = deals.filter((deal) => deal.status === "cancelled");
  const scheduledDeals = activeDeals.filter((deal) => deal.stage === "handover_scheduled");
  const incompleteDeals = activeDeals.filter((deal) =>
    !deal.counterpartyName || deal.stage === "negotiating",
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:handshake"
        kicker="Kesepakatan"
        title="Deal Manual"
        description="Catat progres, pihak yang berminat, dan rencana serah terima tanpa memproses pembayaran di Rotary."
        meta={
          <>
            <Badge tone="brand">Catatan privat seller</Badge>
            <Badge tone="accent">Tanpa payment gateway</Badge>
          </>
        }
        actions={<PrimaryLink href="/dashboard/listings" icon="lucide:package-search">Pilih Listing</PrimaryLink>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon="lucide:handshake" label="Sedang berjalan" value={activeDeals.length} />
        <MiniMetric icon="lucide:calendar-clock" label="Terjadwal" value={scheduledDeals.length} />
        <MiniMetric icon="lucide:clipboard-pen-line" label="Perlu dilengkapi" value={incompleteDeals.length} />
        <MiniMetric icon="lucide:circle-check-big" label="Selesai" value={completedDeals.length} />
      </div>

      <Panel
        title="Kesepakatan berjalan"
        description="Barang berstatus Dipesan yang masih menunggu hasil akhir."
        actions={activeDeals.length > 0 ? <Badge tone="brand">{activeDeals.length} berjalan</Badge> : undefined}
      >
        {activeDeals.length === 0 ? (
          <EmptyState
            icon="lucide:handshake"
            title="Belum ada kesepakatan berjalan"
            description="Tandai listing aktif sebagai Dipesan ketika kamu mulai melanjutkan deal dengan seorang peminat."
            action={<PrimaryLink href="/dashboard/listings" icon="lucide:list">Buka Listing</PrimaryLink>}
          />
        ) : (
          <div className="divide-y divide-[var(--seller-rule)]">
            {activeDeals.map((deal) => (
              <article
                key={deal.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center"
              >
                <ListingThumb imageUrl={deal.listingImageUrl} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">
                      {deal.listingTitle}
                    </h2>
                    <DealStageBadge stage={deal.stage} />
                    <ModeBadge mode={deal.listingMode} />
                  </div>
                  <p className="mt-1 truncate text-[12px] text-[var(--seller-muted)]">
                    {deal.counterpartyName || "Peminat belum dicatat"}
                    {" · "}
                    {formatHandoverMethod(deal.handoverMethod)}
                    {" · "}
                    {formatDealSchedule(deal.scheduledAt)}
                  </p>
                  {deal.listingMode === "sale" && deal.agreedPrice ? (
                    <p className="mt-1 text-[11px] font-semibold text-[var(--seller-brand)]">
                      Kesepakatan {formatPrice(deal.agreedPrice, deal.listingMode)}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/dashboard/deals/${deal.id}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
                >
                  Kelola
                  <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {(completedDeals.length > 0 || cancelledDeals.length > 0) ? (
        <Panel
          title="Riwayat kesepakatan"
          description="Catatan deal yang sudah selesai atau batal. Riwayat ini tidak menjadi bukti pembayaran."
        >
          <div className="divide-y divide-[var(--seller-rule)]">
            {[...completedDeals, ...cancelledDeals].slice(0, 12).map((deal) => (
              <article
                key={deal.id}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center"
              >
                <ListingThumb imageUrl={deal.listingImageUrl} muted />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold text-[var(--seller-ink)]">
                      {deal.listingTitle}
                    </h2>
                    <Badge tone={deal.status === "completed" ? "success" : "neutral"}>
                      {formatDealStatus(deal.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-[var(--seller-muted)]">
                    {deal.counterpartyName || "Tanpa nama peminat"}
                    {" · "}
                    {deal.status === "completed"
                      ? formatDealSchedule(deal.completedAt)
                      : formatDealSchedule(deal.cancelledAt)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/deals/${deal.id}`}
                  className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[8px] px-3 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
                >
                  Lihat catatan
                </Link>
              </article>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
