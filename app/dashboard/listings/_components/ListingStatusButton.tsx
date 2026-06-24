"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { setListingStatusAction } from "../../actions";
import type { ListingStatus } from "@/lib/listing-format";
import { ConfirmDialog, type ConfirmDialogTone } from "@/app/_components/ConfirmDialog";

type Props = {
  listingId: string;
  newStatus: ListingStatus;
  icon: string;
  label: string;
  successMessage: string;
  confirmLabel?: string;
  confirmMessage?: string;
  confirmTitle?: string;
  confirmTone?: ConfirmDialogTone;
  className: string;
};

export function ListingStatusButton({
  listingId,
  newStatus,
  icon,
  label,
  successMessage,
  confirmLabel,
  confirmMessage,
  confirmTitle,
  confirmTone = "brand",
  className,
}: Props) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      try {
        await setListingStatusAction(listingId, newStatus);
        setIsConfirmOpen(false);
        toast.success(successMessage);
        router.refresh();
      } catch {
        setIsConfirmOpen(false);
        toast.error("Gagal memperbarui status listing. Coba lagi.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (confirmMessage) {
            setIsConfirmOpen(true);
            return;
          }
          performAction();
        }}
        disabled={isPending}
        className={className}
      >
        <Icon
          icon={isPending ? "lucide:loader-circle" : icon}
          width={13}
          height={13}
          className={isPending ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {label}
      </button>

      {confirmMessage ? (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title={confirmTitle ?? label}
          description={confirmMessage}
          confirmLabel={confirmLabel ?? label}
          tone={confirmTone}
          isPending={isPending}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={performAction}
        />
      ) : null}
    </>
  );
}
