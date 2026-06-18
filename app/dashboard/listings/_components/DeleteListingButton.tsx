"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { deleteListingAction } from "../../actions";

type Props = {
  listingId: string;
  title: string;
  className: string;
};

export function DeleteListingButton({ listingId, title, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Hapus listing "${title}"?\nFoto barang akan ikut terhapus dan tidak bisa dipulihkan.`)) return;
    startTransition(async () => {
      try {
        await deleteListingAction(listingId);
        toast.success("Listing berhasil dihapus.");
        router.refresh();
      } catch {
        toast.error("Gagal menghapus listing. Coba lagi.");
      }
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={className}>
      <Icon
        icon={isPending ? "lucide:loader-circle" : "lucide:trash-2"}
        width={13}
        height={13}
        className={isPending ? "animate-spin" : ""}
        aria-hidden="true"
      />
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}
