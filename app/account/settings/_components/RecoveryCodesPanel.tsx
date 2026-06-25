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
    <div className="rounded-[10px] border border-[var(--seller-accent)] bg-[var(--seller-accent-soft)] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white text-[var(--seller-brand)]">
          <Icon icon="lucide:shield-keyhole" width={19} height={19} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">Simpan recovery code sekarang</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Kode ini hanya ditampilkan sekali. Setiap kode dapat dipakai satu kali ketika kamu tidak bisa membuka email.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {codes.map((code) => (
          <code
            key={code}
            className="rounded-[7px] border border-[var(--seller-rule)] bg-white px-2 py-2 text-center text-[12px] font-semibold tracking-[0.06em] text-[var(--seller-ink)]"
          >
            {code}
          </code>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyCodes}
          className="inline-flex min-h-10 items-center gap-2 rounded-[7px] bg-[var(--seller-brand)] px-3 text-[11px] font-semibold text-white"
        >
          <Icon icon={copied ? "lucide:check" : "lucide:copy"} width={14} height={14} aria-hidden="true" />
          {copied ? "Tersalin" : "Salin kode"}
        </button>
        <button
          type="button"
          onClick={downloadCodes}
          className="inline-flex min-h-10 items-center gap-2 rounded-[7px] border border-[var(--seller-rule-strong)] bg-white px-3 text-[11px] font-semibold text-[var(--seller-brand)]"
        >
          <Icon icon="lucide:download" width={14} height={14} aria-hidden="true" />
          Unduh
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 items-center px-3 text-[11px] font-semibold text-[var(--seller-muted)]"
        >
          Saya sudah menyimpan
        </button>
      </div>
    </div>
  );
}

