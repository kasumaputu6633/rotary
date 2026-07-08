"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { COMPLAINT_CATEGORIES } from "@/lib/moderation-format";
import { submitUserComplaintAction } from "../actions";

interface ReportUserModalProps {
  conversationId: string;
  reportedUserName: string;
  onClose: () => void;
}

export function ReportUserModal({
  conversationId,
  reportedUserName,
  onClose,
}: ReportUserModalProps) {
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstRadioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus trap: focus first radio on mount
  useEffect(() => {
    firstRadioRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current && !isPending) onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      toast.error("Pilih kategori laporan terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      const result = await submitUserComplaintAction({
        conversationId,
        category,
        description,
      });

      if (result.ok) {
        toast.success("Laporan berhasil dikirim. Tim kami akan segera meninjau.");
        onClose();
      } else {
        toast.error(result.error ?? "Gagal mengirim laporan. Coba lagi.");
      }
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#edf0f5] px-5 py-4">
          <div>
            <h2
              id="report-modal-title"
              className="font-open-sauce text-[15px] font-bold text-gray-900"
            >
              Laporkan Pengguna
            </h2>
            <p className="mt-0.5 font-open-sauce text-[12px] text-gray-400">
              {reportedUserName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Tutup"
          >
            <Icon icon="lucide:x" width={16} height={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4">
          {/* Info notice */}
          <div className="mb-4 flex gap-2.5 rounded-xl border border-[#fff0c2] bg-[#fffbeb] p-3">
            <Icon
              icon="lucide:info"
              width={15}
              height={15}
              className="mt-0.5 shrink-0 text-[#d97706]"
            />
            <p className="font-open-sauce text-[12px] leading-relaxed text-[#92400e]">
              Laporan bersifat anonim. Admin akan meninjau dan mengambil tindakan sesuai
              kebijakan platform.
            </p>
          </div>

          {/* Category */}
          <p className="mb-2.5 font-open-sauce text-[12px] font-semibold text-gray-700">
            Alasan laporan <span className="text-red-500">*</span>
          </p>
          <div className="mb-4 space-y-1.5">
            {COMPLAINT_CATEGORIES.map((cat, idx) => (
              <label
                key={cat}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                  category === cat
                    ? "border-[#17458f] bg-[#eef3fb]"
                    : "border-[#e5e7eb] bg-white hover:bg-[#f8fafc]"
                }`}
              >
                <input
                  ref={idx === 0 ? firstRadioRef : undefined}
                  type="radio"
                  name="report-category"
                  value={cat}
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                  className="accent-[#17458f]"
                />
                <span className="font-open-sauce text-[13px] text-gray-700">{cat}</span>
              </label>
            ))}
          </div>

          {/* Description */}
          <p className="mb-2 font-open-sauce text-[12px] font-semibold text-gray-700">
            Keterangan tambahan{" "}
            <span className="font-normal text-gray-400">(opsional)</span>
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Ceritakan kejadian secara singkat…"
            className="mb-4 w-full resize-none rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 font-open-sauce text-[13px] text-gray-800 outline-none placeholder:text-[#b2b8c3] focus:border-[#17458f] focus:ring-2 focus:ring-[#17458f]/20"
          />

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 font-open-sauce text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!category || isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef476f] py-2.5 font-open-sauce text-[13px] font-semibold text-white transition-colors hover:bg-[#d63d60] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Icon
                    icon="lucide:loader-circle"
                    width={15}
                    height={15}
                    className="animate-spin"
                  />
                  Mengirim...
                </>
              ) : (
                <>
                  <Icon icon="lucide:flag" width={15} height={15} />
                  Kirim Laporan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
