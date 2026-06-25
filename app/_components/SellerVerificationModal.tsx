"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

function VerificationStep({
  complete,
  description,
  icon,
  label,
}: {
  complete: boolean;
  description: string;
  icon: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-[#e5e7eb] bg-[#f9fafb] p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${complete
          ? "bg-[#dcfce7] text-[#16a34a]"
          : "bg-[#eff6ff] text-[#17458f]"
        }`}>
        <Icon icon={complete ? "lucide:circle-check" : icon} width={17} height={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-poppins text-[12px] font-semibold text-black">{label}</p>
          <span className={`font-poppins text-[10px] font-semibold ${complete ? "text-[#16a34a]" : "text-[#6b7280]"
            }`}>
            {complete ? "Sudah terverifikasi" : "Belum terverifikasi"}
          </span>
        </div>
        <p className="mt-1 font-poppins text-[11px] leading-relaxed text-[#6b7280]">{description}</p>
      </div>
    </div>
  );
}

export function SellerVerificationModal({
  isOpen,
  onClose,
  emailVerified,
  phoneVerified,
}: {
  isOpen: boolean;
  onClose: () => void;
  emailVerified: boolean;
  phoneVerified: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => {
        setShowAnimation(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setShowAnimation(false);
      document.body.style.overflow = "";
      const timeout = setTimeout(() => setIsMounted(false), 300); // 300ms transition duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 transition-all duration-300 ease-out ${showAnimation ? "bg-black/50 backdrop-blur-sm opacity-100" : "bg-transparent backdrop-blur-none opacity-0"}`}>
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <section
        role="alertdialog"
        aria-labelledby="seller-verification-title"
        aria-describedby="seller-verification-description"
        className={`relative w-full max-w-[500px] overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out ${showAnimation ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Tutup modal"
        >
          <Icon icon="lucide:x" width={20} height={20} />
        </button>

        <div className="border-b border-[#e5e7eb] px-5 py-5 sm:px-6 sm:py-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-[9px] bg-[#eff6ff] text-[#17458f]">
            <Icon icon="lucide:badge-check" width={22} height={22} aria-hidden="true" />
          </span>
          <h1 id="seller-verification-title" className="mt-4 font-poppins text-[20px] font-semibold leading-tight text-black">
            Verifikasi akun untuk mulai berjualan
          </h1>
          <p id="seller-verification-description" className="mt-2 font-poppins text-[12px] leading-relaxed text-[#6b7280] sm:text-[13px]">
            Selesaikan verifikasi email dan nomor HP sebelum menerbitkan atau mengelola listing barang di Rotary.
          </p>
        </div>

        <div className="grid gap-2.5 px-5 py-5 sm:px-6">
          <VerificationStep
            complete={emailVerified}
            description="Memastikan akses akun dan pemberitahuan penting tetap aman."
            icon="lucide:mail-check"
            label="Verifikasi email"
          />
          <VerificationStep
            complete={phoneVerified}
            description="Mengaktifkan kontak WhatsApp agar peminat dapat menghubungi lapakmu."
            icon="lucide:smartphone"
            label="Verifikasi nomor HP"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#e5e7eb] bg-[#f9fafb] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#cbd5e1] bg-white px-4 font-poppins text-[12px] font-semibold text-[#333] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
          >
            Batal
          </button>
          <Link
            href="/account/settings?tab=contact"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#17458f] px-4 font-poppins text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#113268] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
          >
            Lengkapi verifikasi
            <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
