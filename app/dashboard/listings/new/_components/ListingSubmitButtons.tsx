"use client";

import { useFormStatus } from "react-dom";

type ListingSubmitButtonsProps = {
  draftLabel?: string;
  publishLabel?: string;
  showDraftButton?: boolean;
};

export function ListingSubmitButtons({
  draftLabel = "Simpan Draft",
  publishLabel = "Terbitkan Listing",
  showDraftButton = true,
}: ListingSubmitButtonsProps = {}) {
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
        {pending ? "Menyimpan..." : publishLabel}
      </button>
      {showDraftButton ? (
        <button
          name="intent"
          value="draft"
          type="submit"
          disabled={pending}
          className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] text-[12px] font-semibold text-[var(--seller-brand)] transition hover:bg-[var(--seller-brand-soft)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Menyimpan..." : draftLabel}
        </button>
      ) : null}
    </div>
  );
}
