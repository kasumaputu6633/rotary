"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateListingDealAction } from "@/app/dashboard/actions";
import {
  dealStageOptions,
  handoverMethodOptions,
  type DealStage,
} from "@/lib/deal-format";
import type { ListingMode } from "@/lib/listing-format";
import { SellerSelect } from "@/app/dashboard/_components/SellerSelect";

type DealProgressFormProps = {
  deal: {
    agreedPrice: number | null;
    counterpartyContact: string | null;
    counterpartyName: string | null;
    handoverLocation: string | null;
    handoverMethod: string | null;
    sellerNote: string | null;
    stage: DealStage;
  };
  listingId: string;
  listingMode: ListingMode;
  readOnly?: boolean;
  scheduledAtValue: string;
};

const fieldClass =
  "min-h-11 w-full rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] text-[var(--seller-ink)] outline-none transition-colors placeholder:text-[var(--seller-muted)] focus:border-[var(--seller-brand)] focus:ring-2 focus:ring-[var(--seller-accent-soft)] disabled:cursor-not-allowed disabled:bg-[var(--seller-paper-2)] disabled:text-[var(--seller-muted)]";

function FieldLabel({
  children,
  optional = false,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="mb-1.5 flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--seller-ink)]">
      {children}
      {optional ? <span className="font-normal text-[10px] text-[var(--seller-muted)]">Opsional</span> : null}
    </span>
  );
}

export function DealProgressForm({
  deal,
  listingId,
  listingMode,
  readOnly = false,
  scheduledAtValue,
}: DealProgressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateListingDealAction(listingId, formData);
        toast.success("Catatan kesepakatan berhasil disimpan.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan kesepakatan.");
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <fieldset disabled={readOnly || isPending} className="grid gap-0">
        <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:p-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">Progres kesepakatan</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
              Simpan posisi deal saat ini agar tindak lanjut barang tidak tercecer.
            </p>
          </div>

          <div>
            <FieldLabel>Tahap saat ini</FieldLabel>
            <SellerSelect
              ariaLabel="Tahap saat ini"
              name="stage"
              defaultValue={deal.stage}
              disabled={readOnly || isPending}
              className={fieldClass}
              options={dealStageOptions}
            />
            <span className="mt-1.5 block text-[11px] leading-relaxed text-[var(--seller-muted)]">
              Pilih “Serah terima dijadwalkan” setelah waktu dan caranya sudah pasti.
            </span>
          </div>
        </section>

        <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:grid-cols-2 sm:p-5">
          <div className="sm:col-span-2">
            <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">Pihak yang berminat</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
              Data ini hanya menjadi catatan pribadi seller dan tidak tampil di marketplace.
            </p>
          </div>

          <label>
            <FieldLabel optional>Nama atau penanda</FieldLabel>
            <input
              name="counterpartyName"
              defaultValue={deal.counterpartyName ?? ""}
              maxLength={120}
              className={fieldClass}
              placeholder="Contoh: Ayu / peminat WhatsApp"
            />
          </label>

          <label>
            <FieldLabel optional>Kontak</FieldLabel>
            <input
              name="counterpartyContact"
              defaultValue={deal.counterpartyContact ?? ""}
              maxLength={80}
              className={fieldClass}
              placeholder="Nomor atau akun yang digunakan"
            />
          </label>

          {listingMode === "sale" ? (
            <label className="sm:col-span-2 sm:max-w-[320px]">
              <FieldLabel optional>Harga yang disepakati</FieldLabel>
              <div className="flex min-h-11 overflow-hidden rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] focus-within:border-[var(--seller-brand)] focus-within:ring-2 focus-within:ring-[var(--seller-accent-soft)]">
                <span className="flex items-center border-r border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 text-[12px] font-semibold text-[var(--seller-muted)]">Rp</span>
                <input
                  name="agreedPrice"
                  defaultValue={deal.agreedPrice ?? ""}
                  inputMode="numeric"
                  className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-[var(--seller-ink)] outline-none disabled:cursor-not-allowed disabled:bg-[var(--seller-paper-2)]"
                  placeholder="0"
                />
              </div>
            </label>
          ) : null}
        </section>

        <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:grid-cols-2 sm:p-5">
          <div className="sm:col-span-2">
            <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">Rencana serah terima</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">
              Rotary tidak mengatur kurir atau pembayaran. Detail berikut disepakati langsung antar pengguna.
            </p>
          </div>

          <div>
            <FieldLabel optional>Cara penyerahan</FieldLabel>
            <SellerSelect
              ariaLabel="Cara penyerahan"
              name="handoverMethod"
              defaultValue={deal.handoverMethod ?? ""}
              disabled={readOnly || isPending}
              className={fieldClass}
              options={handoverMethodOptions}
            />
          </div>

          <label>
            <FieldLabel optional>Jadwal</FieldLabel>
            <input
              type="datetime-local"
              name="scheduledAt"
              defaultValue={scheduledAtValue}
              className={fieldClass}
            />
          </label>

          <label className="sm:col-span-2">
            <FieldLabel optional>Lokasi atau petunjuk penyerahan</FieldLabel>
            <input
              name="handoverLocation"
              defaultValue={deal.handoverLocation ?? ""}
              className={fieldClass}
              placeholder="Contoh: titik temu di area parkir sisi utara"
            />
          </label>
        </section>

        <section className="grid gap-4 p-4 sm:p-5">
          <label>
            <FieldLabel optional>Catatan internal</FieldLabel>
            <textarea
              name="sellerNote"
              defaultValue={deal.sellerNote ?? ""}
              rows={4}
              className={`${fieldClass} resize-y py-3 leading-relaxed`}
              placeholder="Detail yang perlu kamu ingat sebelum penyerahan barang."
            />
          </label>

          {!readOnly ? (
            <div className="flex flex-col-reverse gap-3 border-t border-[var(--seller-rule)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                <Icon icon="lucide:lock-keyhole" width={14} height={14} className="mt-0.5 shrink-0 text-[var(--seller-brand)]" aria-hidden="true" />
                Catatan tidak dibagikan kepada peminat atau pengguna lain.
              </p>
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-[var(--seller-accent)] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon={isPending ? "lucide:loader-circle" : "lucide:save"} width={15} height={15} className={isPending ? "animate-spin" : ""} aria-hidden="true" />
                {isPending ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </div>
          ) : (
            <p className="flex items-start gap-2 border-t border-[var(--seller-rule)] pt-4 text-[11px] leading-relaxed text-[var(--seller-muted)]">
              <Icon icon="lucide:lock-keyhole" width={14} height={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Riwayat kesepakatan yang sudah ditutup disimpan sebagai catatan dan tidak dapat diubah.
            </p>
          )}
        </section>
      </fieldset>
    </form>
  );
}
