"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/_components/ConfirmDialog";
import { formatIndonesianPhone } from "@/lib/phone";
import { removeAccountPhoneAction } from "../actions";
import { PhoneVerificationModal } from "./PhoneVerificationModal";

type PhoneVerificationCardProps = {
  phone: string | null;
  verified: boolean;
};

export function PhoneVerificationCard({ phone, verified }: PhoneVerificationCardProps) {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isVerified = Boolean(phone && verified);

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAccountPhoneAction();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.message ?? "Nomor HP dihapus.");
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Nomor HP akun</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--seller-muted)]">
              <Icon icon="lucide:message-circle-more" width={12} height={12} aria-hidden="true" />
              Kontak listing
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Dipakai untuk OTP keamanan dan tombol WhatsApp pada listing publik.
          </p>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)]">
          <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            {isVerified ? (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--seller-success-soft)] text-[var(--seller-success)]">
                  <Icon icon="lucide:badge-check" width={19} height={19} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-poppins text-[14px] font-semibold tabular-nums text-[var(--seller-ink)]">
                    {formatIndonesianPhone(phone!)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--seller-success)]">
                    <Icon icon="lucide:check" width={11} height={11} aria-hidden="true" />
                    Terverifikasi via WhatsApp
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--seller-paper-2)] text-[var(--seller-muted)]">
                  <Icon icon="lucide:smartphone-nfc" width={19} height={19} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[var(--seller-ink)]">
                    {phone ? "Belum terverifikasi" : "Belum terhubung"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                    {phone
                      ? "Verifikasi ulang nomor HP untuk mengaktifkan keamanan dan kontak WhatsApp."
                      : "Tambah nomor HP untuk OTP keamanan dan kontak WhatsApp listing."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[7px] bg-[var(--seller-brand)] px-3 text-[12px] font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
              >
                <Icon
                  icon={isVerified ? "lucide:pencil" : "lucide:plus"}
                  width={13}
                  height={13}
                  aria-hidden="true"
                />
                {isVerified ? "Ubah nomor" : phone ? "Verifikasi nomor" : "Tambah & verifikasi"}
              </button>
              {phone ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isPending}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-semibold text-[var(--seller-danger)] transition-colors hover:bg-[var(--seller-danger-soft)] disabled:opacity-50"
                >
                  <Icon icon="lucide:trash-2" width={13} height={13} aria-hidden="true" />
                  Hapus
                </button>
              ) : null}
            </div>
          </div>

          <p className="flex items-start gap-2 border-t border-[var(--seller-rule)] px-4 py-3 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            <Icon icon="lucide:shield-check" width={12} height={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Kode OTP dikirim langsung melalui WhatsApp dan berlaku selama 5 menit. Jangan bagikan kode kepada siapa pun.
            </span>
          </p>
        </div>
      </section>

      {isModalOpen
        ? createPortal(
            <PhoneVerificationModal
              onClose={() => setModalOpen(false)}
              onVerified={() => router.refresh()}
            />,
            document.body,
          )
        : null}

      {isConfirmOpen
        ? createPortal(
            <ConfirmDialog
              isOpen
              onCancel={() => setConfirmOpen(false)}
              onConfirm={handleRemove}
              title="Hapus nomor HP?"
              description="Nomor HP akan dihapus dari akun. Kamu bisa menambahkan & memverifikasinya lagi nanti."
              confirmLabel="Hapus"
              pendingLabel="Menghapus..."
              tone="danger"
              isPending={isPending}
            />,
            document.body,
          )
        : null}
    </>
  );
}
