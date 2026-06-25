"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { EmailVerificationModal } from "./EmailVerificationModal";

export function EmailVerificationCard({
  email,
  verified,
}: {
  email: string | null;
  verified: boolean;
}) {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="grid gap-4 border-b border-[var(--seller-rule)] p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Email akun</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--seller-muted)]">
              <Icon icon="lucide:lock-keyhole" width={12} height={12} aria-hidden="true" />
              Privat
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Dipakai untuk login, pemulihan akun, dan pemberitahuan keamanan.
          </p>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)]">
          <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                verified
                  ? "bg-[var(--seller-success-soft)] text-[var(--seller-success)]"
                  : "bg-[var(--seller-paper-2)] text-[var(--seller-muted)]"
              }`}>
                <Icon icon={verified ? "lucide:badge-check" : "lucide:mail-warning"} width={19} height={19} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-all font-poppins text-[13px] font-semibold text-[var(--seller-ink)]">
                  {email ?? "Email belum ditambahkan"}
                </p>
                <p className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${
                  verified ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"
                }`}>
                  <Icon icon={verified ? "lucide:check" : "lucide:circle-alert"} width={11} height={11} aria-hidden="true" />
                  {verified ? "Email terverifikasi" : "Verifikasi diperlukan untuk mulai berjualan"}
                </p>
              </div>
            </div>

            {!verified ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[7px] bg-[var(--seller-brand)] px-3 text-[12px] font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
              >
                <Icon icon="lucide:mail-check" width={13} height={13} aria-hidden="true" />
                {email ? "Verifikasi email" : "Tambah & verifikasi"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {isModalOpen
        ? createPortal(
            <EmailVerificationModal
              defaultEmail={email ?? ""}
              onClose={() => setModalOpen(false)}
              onVerified={() => router.refresh()}
            />,
            document.body,
          )
        : null}
    </>
  );
}
