"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

const orderSteps = [
  { label: "Konfirmasi", icon: "lucide:clock-3" },
  { label: "Diproses", icon: "lucide:refresh-cw" },
  { label: "Dikirim", icon: "lucide:truck" },
  { label: "Sampai", icon: "lucide:map-pin" },
];

const activities = [
  {
    title: "Pesanan rak buku menunggu konfirmasi",
    description: "Selesaikan proses dalam 24 jam agar barang tetap tersedia.",
    icon: "lucide:receipt-text",
    accent: "text-[#f7a81b]",
  },
  {
    title: "Ada chat baru dari calon pembeli",
    description: "Balas pertanyaan produk untuk mempercepat transaksi.",
    icon: "lucide:message-circle",
    accent: "text-[#17458f]",
  },
];

export default function NavbarNotificationButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      setDropdownPosition({
        top: rect.bottom + 8,
        right: isMobile ? 16 : Math.max(16, window.innerWidth - rect.right),
      });
      setIsPositioned(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsPositioned(false);
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  useEffect(() => {
    function handleClose() {
      setShowDropdown(false);
    }

    window.addEventListener("navbarDropdownClose", handleClose);
    return () => window.removeEventListener("navbarDropdownClose", handleClose);
  }, []);

  useEffect(() => {
    const event = new CustomEvent("profileDropdownToggle", { detail: { isOpen: showDropdown } });
    window.dispatchEvent(event);
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowDropdown((open) => !open)}
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#fff7e8] ${showDropdown ? "bg-[#fff7e8]" : ""
          }`}
        aria-label="Notifikasi"
        aria-expanded={showDropdown}
      >
        <Icon icon="lucide:bell" width={21} height={21} className="text-[#555]" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef476f] font-poppins text-[9px] font-bold text-white">
          2
        </span>
      </button>

      {showDropdown && isPositioned && (
        <div
          className="fixed z-[9999] w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-gray-200/80 bg-white animate-[dropdownSlideIn_180ms_cubic-bezier(0.2,0.8,0.2,1)_both] md:w-[min(400px,calc(100vw-32px))]"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            boxShadow: "0 18px 44px rgba(23, 69, 143, 0.18), 0 8px 22px rgba(0, 0, 0, 0.16)",
          }}
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-poppins text-[17px] font-semibold text-black">Notifikasi</h2>
                <span className="flex items-center gap-1 font-poppins text-[10px] font-semibold text-[#ef476f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef476f]" />
                  2 baru
                </span>
              </div>
              <p className="mt-0.5 font-poppins text-[11px] text-[#6b7280]">Aktivitas jual beli dan pesan penting.</p>
            </div>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f4f6f8] hover:text-[#17458f]"
              aria-label="Pengaturan notifikasi"
            >
              <Icon icon="lucide:settings" width={17} height={17} aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            <section className="px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins text-[14px] font-semibold text-black">Ringkasan Transaksi</h3>
                <button type="button" className="font-poppins text-[12px] font-semibold text-[#17458f] hover:text-[#f7a81b]">
                  Lihat Semua
                </button>
              </div>

              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 font-poppins text-[12px] text-black">
                <Icon icon="lucide:wallet-cards" width={17} height={17} className="shrink-0 text-[#f7a81b]" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">Menunggu pembayaran</span>
                  <span className="block truncate text-[10px] text-[#6b7280]">Selesaikan transaksi aktif kamu.</span>
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {orderSteps.map((step) => (
                  <button
                    key={step.label}
                    type="button"
                    className="group flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors hover:bg-[#fff7e8]"
                  >
                    <Icon icon={step.icon} width={21} height={21} className="text-[#17458f] transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                    <span className="font-poppins text-[10px] leading-tight text-black">{step.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t-[6px] border-[#f4f6f8] px-4 py-3">
              <h3 className="font-poppins text-[14px] font-semibold text-black">Aktivitas Terbaru</h3>
              <div className="mt-3 grid gap-2">
                {activities.map((activity) => (
                  <button
                    key={activity.title}
                    type="button"
                    className="group grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-lg border-l-2 border-transparent p-2 text-left transition-colors hover:border-[#f7a81b] hover:bg-[#fffdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                  >
                    <Icon icon={activity.icon} width={18} height={18} className={`${activity.accent} mt-0.5 transition-transform group-hover:-translate-y-0.5`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate font-poppins text-[12px] font-semibold text-black group-hover:text-[#17458f]">
                        {activity.title}
                      </span>
                      <span className="mt-0.5 block font-poppins text-[11px] leading-snug text-[#6b7280]">
                        {activity.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t-[6px] border-[#f4f6f8] px-4 py-3">
              <h3 className="font-poppins text-[14px] font-semibold text-black">Aksi Cepat</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#f7a81b] font-poppins text-[12px] font-semibold text-white transition-colors hover:bg-[#e89a14]"
                >
                  <Icon icon="lucide:shopping-bag" width={15} height={15} aria-hidden="true" />
                  Cek Belanja
                </button>
                <button
                  type="button"
                  className="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#17458f] font-poppins text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#eef6ff]"
                >
                  <Icon icon="lucide:plus-circle" width={15} height={15} aria-hidden="true" />
                  Jual Barang
                </button>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <button type="button" className="font-poppins text-[12px] font-semibold text-[#17458f] hover:text-[#f7a81b]">
              Tandai semua dibaca
            </button>
            <button type="button" className="font-poppins text-[12px] font-semibold text-[#17458f] hover:text-[#f7a81b]">
              Lihat selengkapnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
