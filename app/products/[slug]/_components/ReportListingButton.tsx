"use client";

import { Icon } from "@iconify/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { COMPLAINT_CATEGORIES } from "@/lib/moderation-format";
import { submitComplaintAction } from "../actions";

export default function ReportListingButton({
  listingId,
}: {
  listingId: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function reset() {
    setCategory("");
    setDescription("");
  }

  function handleSubmit() {
    if (!category) {
      toast.error("Pilih kategori laporan terlebih dahulu.");
      return;
    }
    startTransition(async () => {
      const result = await submitComplaintAction({
        listingId,
        category,
        description,
      });
      if (result.ok) {
        toast.success("Laporan terkirim. Tim kami akan meninjaunya.");
        setOpen(false);
        reset();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 font-open-sauce text-[12px] font-medium text-[#9ca3af] transition-colors hover:text-red-500"
      >
        <Icon icon="lucide:flag" width={13} height={13} aria-hidden="true" />
        Laporkan listing ini
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Icon icon="lucide:flag" width={18} height={18} />
                </div>
                <div>
                  <h2 className="font-open-sauce text-[15px] font-bold text-gray-900">
                    Laporkan Listing
                  </h2>
                  <p className="font-open-sauce text-[12px] text-gray-400">
                    Bantu kami menjaga Rotary tetap aman.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                aria-label="Tutup"
              >
                <Icon icon="lucide:x" width={18} height={18} />
              </button>
            </div>

            <label className="mb-1.5 block font-open-sauce text-[12px] font-semibold text-gray-600">
              Kategori laporan
            </label>
            <div className="mb-4 grid gap-1.5">
              {COMPLAINT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left font-open-sauce text-[13px] transition-colors ${
                    category === cat
                      ? "border-[#17458f] bg-[#eef3fb] font-semibold text-[#17458f]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                  {category === cat ? (
                    <Icon icon="lucide:check" width={15} height={15} />
                  ) : null}
                </button>
              ))}
            </div>

            <label className="mb-1.5 block font-open-sauce text-[12px] font-semibold text-gray-600">
              Detail tambahan{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Jelaskan masalah yang Anda temukan…"
              className="mb-4 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-open-sauce text-[13px] text-gray-800 outline-none focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 font-open-sauce text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? (
                  <Icon
                    icon="lucide:loader-circle"
                    width={15}
                    height={15}
                    className="animate-spin"
                  />
                ) : (
                  <Icon icon="lucide:send" width={15} height={15} />
                )}
                {isPending ? "Mengirim…" : "Kirim Laporan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
