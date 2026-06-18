"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { setListingStatusAction } from "../../actions";
import type { ListingStatus } from "@/lib/listing-format";

type Props = {
  listingId: string;
  newStatus: ListingStatus;
  icon: string;
  label: string;
  successMessage: string;
  confirmMessage?: string;
  className: string;
};

export function ListingStatusButton({
  listingId,
  newStatus,
  icon,
  label,
  successMessage,
  confirmMessage,
  className,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        await setListingStatusAction(listingId, newStatus);
        toast.success(successMessage);
        router.refresh();
      } catch {
        toast.error("Gagal memperbarui status listing. Coba lagi.");
      }
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={className}>
      <Icon
        icon={isPending ? "lucide:loader-circle" : icon}
        width={13}
        height={13}
        className={isPending ? "animate-spin" : ""}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}
