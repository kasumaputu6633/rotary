"use client";

import { useFormStatus } from "react-dom";

export function ListingSubmitButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="mt-4 grid gap-2">
      <button
        name="intent"
        value="publish"
        type="submit"
        disabled={pending}
        className="h-10 rounded-[8px] bg-[var(--seller-accent)] text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Mengupload listing..." : "Terbitkan Listing"}
      </button>
      <button
        name="intent"
        value="draft"
        type="submit"
        disabled={pending}
        className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] text-[12px] font-semibold text-[var(--seller-brand)] transition hover:bg-[var(--seller-brand-soft)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Menyimpan..." : "Simpan Draft"}
      </button>
    </div>
  );
}
