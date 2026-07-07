"use client";

type ListingSubmitButtonsProps = {
  draftLabel?: string;
  isPending?: boolean;
  onIntentChange?: (intent: string) => void;
  publishLabel?: string;
  showDraftButton?: boolean;
};

export function ListingSubmitButtons({
  draftLabel = "Simpan Draft",
  isPending = false,
  onIntentChange,
  publishLabel = "Terbitkan Listing",
  showDraftButton = true,
}: ListingSubmitButtonsProps = {}) {
  return (
    <div className="mt-4 grid gap-2">
      <button
        type="submit"
        disabled={isPending}
        onClick={() => onIntentChange?.("publish")}
        className="min-h-11 rounded-[8px] bg-[var(--seller-accent)] text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Menyimpan..." : publishLabel}
      </button>
      {showDraftButton ? (
        <button
          type="submit"
          disabled={isPending}
          onClick={() => onIntentChange?.("draft")}
          className="min-h-11 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] text-[12px] font-semibold text-[var(--seller-brand)] transition hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Menyimpan..." : draftLabel}
        </button>
      ) : null}
    </div>
  );
}

