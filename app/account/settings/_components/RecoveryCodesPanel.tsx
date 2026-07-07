"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";

export function RecoveryCodesPanel({
  codes,
  onClose,
}: {
  codes: string[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCodes() {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    toast.success("Recovery code disalin.");
  }

  function downloadCodes() {
    const content = [
      "Recovery code akun Rotary",
      "Simpan di tempat aman. Setiap kode hanya dapat dipakai satu kali.",
      "",
      ...codes,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rotary-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="overflow-hidden rounded-[9px] border border-[var(--seller-rule-strong)] bg-white">
      <div className="flex items-start gap-3 border-b border-[var(--seller-rule)] px-4 py-4 sm:px-5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--seller-accent)] bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
          <Icon icon="lucide:key-round" width={15} height={15} strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">Simpan recovery code sekarang</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Kode hanya ditampilkan sekali dan masing-masing berlaku untuk satu kali login.
          </p>
        </div>
      </div>

      <div className="bg-[var(--seller-surface-2)] px-4 py-4 sm:px-5">
        <div className="grid grid-cols-2 overflow-hidden rounded-[7px] border border-[var(--seller-rule)] bg-white sm:grid-cols-4">
          {codes.map((code, index) => (
            <div
              key={code}
              className="flex min-w-0 items-center gap-2 border-b border-r border-[var(--seller-rule)] px-3 py-2.5 [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0 sm:[&:nth-last-child(-n+4)]:border-b-0"
            >
              <span className="w-4 shrink-0 text-[9px] font-semibold tabular-nums text-[var(--seller-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <code className="min-w-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-[var(--seller-ink)] sm:text-[12px]">
                {code}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--seller-rule)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCodes}
            className="inline-flex min-h-9 items-center gap-2 rounded-[7px] bg-[var(--seller-brand)] px-3 text-[11px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
          >
            <Icon icon={copied ? "lucide:check" : "lucide:copy"} width={13} height={13} aria-hidden="true" />
            {copied ? "Tersalin" : "Salin kode"}
          </button>
          <button
            type="button"
            onClick={downloadCodes}
            className="inline-flex min-h-9 items-center gap-2 rounded-[7px] border border-[var(--seller-rule-strong)] bg-white px-3 text-[11px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
          >
            <Icon icon="lucide:download" width={13} height={13} aria-hidden="true" />
            Unduh
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 items-center justify-center rounded-[7px] px-2 text-[11px] font-semibold text-[var(--seller-muted)] transition-colors hover:bg-[var(--seller-surface-2)] hover:text-[var(--seller-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
        >
          Saya sudah menyimpan
        </button>
      </div>
    </section>
  );
}
