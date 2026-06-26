"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { renewListingAction } from "../../actions";

type Props = {
  listingId: string;
};

export function RenewListingButton({ listingId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRenew() {
    startTransition(async () => {
      try {
        const res = await renewListingAction(listingId);
        if (res.success) {
          toast.success(res.message);
          router.refresh();
        } else {
          toast.error("Gagal memperbarui listing.");
        }
      } catch {
        toast.error("Gagal memperbarui listing. Coba lagi.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleRenew}
      disabled={isPending}
      className="inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon
        icon={isPending ? "lucide:loader-circle" : "lucide:refresh-cw"}
        width={13}
        height={13}
        className={isPending ? "animate-spin" : ""}
        aria-hidden="true"
      />
      Konfirmasi Masih Ada
    </button>
  );
}
