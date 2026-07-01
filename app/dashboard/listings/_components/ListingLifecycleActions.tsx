import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ListingMode, ListingStatus } from "@/lib/listing-format";
import { DeleteListingButton } from "./DeleteListingButton";
import { ListingStatusButton } from "./ListingStatusButton";

type ListingLifecycleActionsProps = {
  density?: "compact" | "comfortable";
  listingId: string;
  mode: ListingMode;
  status: ListingStatus;
  title: string;
};

export function ListingLifecycleActions({
  density = "compact",
  listingId,
  mode,
  status,
  title,
}: ListingLifecycleActionsProps) {
  const heightClass = density === "compact" ? "min-h-10" : "min-h-11";
  const baseClass = `inline-flex ${heightClass} items-center gap-2 whitespace-nowrap rounded-[8px] px-3 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-60`;
  const secondaryClass = `${baseClass} border border-[var(--seller-rule-strong)] text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]`;
  const accentClass = `${baseClass} border border-[var(--seller-accent)] text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]`;
  const primaryClass = `${baseClass} bg-[var(--seller-accent)] text-white hover:brightness-95`;
  const dangerClass = `${baseClass} border border-[var(--seller-danger)] text-[var(--seller-danger)] hover:bg-[var(--seller-danger-soft)]`;
  const completedLabel = mode === "sale" ? "Terjual" : "Tersalurkan";

  if (status === "blocked") {
    return (
      <div className="flex items-start gap-2 rounded-[8px] border border-[var(--seller-danger)] bg-[var(--seller-danger-soft)] px-3 py-2 text-[12px] text-[var(--seller-danger)]">
        <Icon icon="lucide:shield-alert" width={15} height={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Listing ini <span className="font-semibold">diblokir oleh admin</span> karena diduga melanggar ketentuan. Hubungi admin jika keberatan.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/listings/${listingId}/edit`} className={secondaryClass}>
        Edit
      </Link>

      {status === "draft" ? (
        <ListingStatusButton
          listingId={listingId}
          newStatus="active"
          icon="lucide:send"
          label="Terbitkan"
          successMessage="Listing berhasil diterbitkan."
          className={accentClass}
        />
      ) : null}

      {status === "active" ? (
        <>
          <ListingStatusButton
            listingId={listingId}
            newStatus="reserved"
            icon="lucide:handshake"
            label="Tandai Dipesan"
            successMessage="Listing ditandai sedang dipesan."
            confirmTitle="Tandai barang sebagai dipesan?"
            confirmMessage={`"${title}" akan tetap terlihat di marketplace dengan status Dipesan. Kontak baru akan dijeda sampai kamu memperbarui statusnya.`}
            confirmLabel="Ya, Tandai Dipesan"
            confirmTone="accent"
            className={primaryClass}
          />
          <ListingStatusButton
            listingId={listingId}
            newStatus="inactive"
            icon="lucide:eye-off"
            label="Nonaktifkan"
            successMessage="Listing berhasil dinonaktifkan."
            confirmTitle="Nonaktifkan listing?"
            confirmMessage={`"${title}" akan disembunyikan dari marketplace sampai kamu mengaktifkannya kembali.`}
            confirmLabel="Ya, Nonaktifkan"
            confirmTone="brand"
            className={secondaryClass}
          />
        </>
      ) : null}

      {status === "reserved" ? (
        <>
          <ListingStatusButton
            listingId={listingId}
            newStatus="completed"
            icon={mode === "sale" ? "lucide:badge-check" : "lucide:hand-heart"}
            label={`Tandai ${completedLabel}`}
            successMessage={`Listing berhasil ditandai ${completedLabel.toLowerCase()}.`}
            confirmTitle={mode === "sale" ? "Konfirmasi barang terjual?" : "Konfirmasi barang tersalurkan?"}
            confirmMessage={`"${title}" akan ditandai ${completedLabel.toLowerCase()} dan dihapus dari marketplace publik. Rotary tidak memproses pembayaran atau kesepakatan antar pengguna.`}
            confirmLabel={`Ya, Tandai ${completedLabel}`}
            confirmTone="success"
            className={primaryClass}
          />
          <ListingStatusButton
            listingId={listingId}
            newStatus="active"
            icon="lucide:rotate-ccw"
            label="Tersedia Lagi"
            successMessage="Listing kembali tersedia di marketplace."
            className={secondaryClass}
          />
        </>
      ) : null}

      {status === "completed" ? (
        <ListingStatusButton
          listingId={listingId}
          newStatus="active"
          icon="lucide:refresh-cw"
          label="Tawarkan Lagi"
          successMessage="Listing kembali tersedia di marketplace."
          confirmTitle="Tawarkan barang kembali?"
          confirmMessage={`"${title}" akan kembali tampil sebagai barang tersedia. Status selesai sebelumnya akan dihapus.`}
          confirmLabel="Ya, Tawarkan Lagi"
          confirmTone="brand"
          className={accentClass}
        />
      ) : null}

      {status === "inactive" ? (
        <ListingStatusButton
          listingId={listingId}
          newStatus="active"
          icon="lucide:rotate-ccw"
          label="Aktifkan"
          successMessage="Listing berhasil diaktifkan."
          className={accentClass}
        />
      ) : null}

      <DeleteListingButton
        listingId={listingId}
        title={title}
        className={dangerClass}
      />
    </div>
  );
}
