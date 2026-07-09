import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  formatDealSchedule,
  formatDealStatus,
  formatHandoverMethod,
  toDateTimeLocalValue,
} from "@/lib/deal-format";
import { getSellerChatContacts, getSellerDealById } from "@/lib/deals";
import { formatPrice } from "@/lib/listing-format";
import {
  Badge,
  DealStageBadge,
  ListingThumb,
  ModeBadge,
  PageHeader,
  Panel,
  SecondaryLink,
} from "../../_components/SellerCenterUi";
import { ListingLifecycleActions } from "../../listings/_components/ListingLifecycleActions";
import { DealProgressForm } from "../_components/DealProgressForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SellerDealDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireRole("user");
  const deal = await getSellerDealById(id, user.id);

  if (!deal) notFound();

  const isActive = deal.status === "active";

  // Kontak selalu diambil: dipakai untuk memilih buyer (saat active) dan untuk
  // menampilkan nama buyer yang sudah tersimpan (saat read-only/completed).
  const contacts = await getSellerChatContacts(user.id, deal.listingId);

  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:clipboard-pen-line"
        kicker="Kesepakatan"
        title={deal.listingTitle}
        description={
          isActive
            ? "Kelola detail deal manual dan rencana penyerahan barang dari satu catatan privat."
            : "Lihat kembali catatan deal yang sudah ditutup."
        }
        meta={
          <>
            <DealStageBadge stage={deal.stage} />
            <Badge tone={deal.status === "completed" ? "success" : deal.status === "cancelled" ? "neutral" : "brand"}>
              {formatDealStatus(deal.status)}
            </Badge>
            <ModeBadge mode={deal.listingMode} />
          </>
        }
        actions={
          <>
            <SecondaryLink href="/dashboard/deals" icon="lucide:arrow-left">Kembali</SecondaryLink>
            <SecondaryLink href={`/dashboard/listings/${deal.listingId}/edit`} icon="lucide:pencil">Edit Listing</SecondaryLink>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Panel>
          <DealProgressForm
            contacts={contacts}
            deal={deal}
            listingId={deal.listingId}
            listingMode={deal.listingMode}
            readOnly={!isActive}
            scheduledAtValue={toDateTimeLocalValue(deal.scheduledAt)}
          />
        </Panel>

        <aside className="grid content-start gap-4">
          <Panel title="Konteks listing" description="Barang yang sedang dibahas dalam kesepakatan ini.">
            <div className="grid gap-4 p-4">
              <div className="flex items-start gap-3">
                <ListingThumb imageUrl={deal.listingImageUrl} muted={!isActive} />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug text-[var(--seller-ink)]">{deal.listingTitle}</p>
                  <p className="mt-1 text-[12px] text-[var(--seller-muted)]">{deal.listingCategory}</p>
                  <p className="mt-1 text-[15px] font-semibold text-[var(--seller-brand)]">
                    {formatPrice(deal.listingPrice, deal.listingMode)}
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-[var(--seller-rule)] border-y border-[var(--seller-rule)] text-[12px]">
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-2.5">
                  <dt className="text-[var(--seller-muted)]">Peminat</dt>
                  <dd className="font-semibold text-[var(--seller-ink)]">{deal.counterpartyName || "Belum dicatat"}</dd>
                </div>
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-2.5">
                  <dt className="text-[var(--seller-muted)]">Kontak</dt>
                  <dd className="font-semibold text-[var(--seller-ink)]">{deal.counterpartyContact || "Belum dicatat"}</dd>
                </div>
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-2.5">
                  <dt className="text-[var(--seller-muted)]">Penyerahan</dt>
                  <dd className="font-semibold text-[var(--seller-ink)]">{formatHandoverMethod(deal.handoverMethod)}</dd>
                </div>
                {deal.handoverLocation && (
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-2.5">
                    <dt className="text-[var(--seller-muted)]">Lokasi</dt>
                    <dd className="font-semibold leading-relaxed text-[var(--seller-ink)]">{deal.handoverLocation}</dd>
                  </div>
                )}
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-2.5">
                  <dt className="text-[var(--seller-muted)]">Jadwal</dt>
                  <dd className="font-semibold leading-relaxed text-[var(--seller-ink)]">{formatDealSchedule(deal.scheduledAt)}</dd>
                </div>
              </dl>

              {deal.sellerNote && (
                <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-brand-soft)] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--seller-muted)]">Catatan penjual</p>
                  <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-[var(--seller-ink)]">{deal.sellerNote}</p>
                </div>
              )}

              {deal.listingStatus === "active" || deal.listingStatus === "reserved" ? (
                <Link
                  href={`/products/${deal.listingSlug}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)]"
                >
                  <Icon icon="lucide:external-link" width={14} height={14} aria-hidden="true" />
                  Lihat halaman publik
                </Link>
              ) : (
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                  <Icon icon="lucide:eye-off" width={14} height={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Listing ini tidak sedang tampil di marketplace publik.
                </p>
              )}
            </div>
          </Panel>

          {isActive ? (
            <Panel title="Hasil kesepakatan" description="Tutup deal atau kembalikan barang menjadi tersedia.">
              <div className="p-4">
                <ListingLifecycleActions
                  density="comfortable"
                  listingId={deal.listingId}
                  mode={deal.listingMode}
                  status={deal.listingStatus}
                  title={deal.listingTitle}
                />
              </div>
            </Panel>
          ) : (
            <div className="border-l-2 border-[var(--seller-rule-strong)] py-1 pl-4">
              <p className="text-[12px] font-semibold text-[var(--seller-ink)]">Riwayat tersimpan</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                Catatan ini bersifat internal dan bukan bukti pembayaran, pengiriman, atau penerimaan barang.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
