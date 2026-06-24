"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { deleteListingAction } from "../../actions";
import { ConfirmDialog } from "@/app/_components/ConfirmDialog";

type Props = {
  listingId: string;
  title: string;
  className: string;
};

export function DeleteListingButton({ listingId, title, className }: Props) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteListingAction(listingId);
        setIsConfirmOpen(false);
        toast.success("Listing berhasil dihapus.");
        router.refresh();
      } catch {
        setIsConfirmOpen(false);
        toast.error("Gagal menghapus listing. Coba lagi.");
      }
    });
  }

  return (
    <>
      <button type="button" onClick={() => setIsConfirmOpen(true)} disabled={isPending} className={className}>
        <Icon
          icon={isPending ? "lucide:loader-circle" : "lucide:trash-2"}
          width={13}
          height={13}
          className={isPending ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {isPending ? "Menghapus..." : "Hapus"}
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus listing?"
        description={`"${title}" akan dihapus permanen bersama seluruh foto barang. Tindakan ini tidak bisa dipulihkan.`}
        icon="lucide:trash-2"
        tone="danger"
        confirmLabel="Ya, Hapus"
        pendingLabel="Menghapus..."
        isPending={isPending}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
