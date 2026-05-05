"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

const cartItems = [
  { name: "Rak Buku Kayu Minimalis", variant: "Rumah Tangga", price: "Rp. 180.000", qty: 1 },
  { name: "Kipas Angin Meja Kecil", variant: "Elektronik", price: "Rp. 75.000", qty: 1 },
  { name: "Lampu Belajar Putih", variant: "Perlengkapan", price: "Rp. 55.000", qty: 2 },
  { name: "Sneakers Hitam Bekas", variant: "Fashion", price: "Rp. 90.000", qty: 1 },
  { name: "Kamera Digital Compact", variant: "Elektronik", price: "Rp. 350.000", qty: 1 },
];

export default function NavbarCartButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);

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
        aria-label="Keranjang"
        aria-expanded={showDropdown}
      >
        <Icon icon="lucide:shopping-bag" width={21} height={21} className="text-[#555]" aria-hidden="true" />
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f7a81b] font-poppins text-[8px] font-bold text-white">
          {cartItems.length}
        </span>
      </button>

      {showDropdown && isPositioned && (
        <div
          className="fixed z-[9999] w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-gray-200/80 bg-white animate-[dropdownSlideIn_180ms_cubic-bezier(0.2,0.8,0.2,1)_both] md:w-[min(440px,calc(100vw-32px))]"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            boxShadow: "0 18px 44px rgba(23, 69, 143, 0.18), 0 8px 22px rgba(0, 0, 0, 0.16)",
          }}
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="font-poppins text-[17px] font-semibold text-black">
                Keranjang <span className="text-[#6b7280]">({cartItems.length})</span>
              </h2>
              <p className="mt-0.5 font-poppins text-[11px] text-[#6b7280]">{totalItems} barang siap dicek ulang.</p>
            </div>
            <button
              type="button"
              className="font-poppins text-[13px] font-semibold text-[#17458f] transition-colors hover:text-[#f7a81b]"
            >
              Lihat
            </button>
          </div>

          <div className="max-h-[326px] overflow-y-auto px-4 py-1.5">
            {cartItems.map((item) => (
              <button
                key={item.name}
                type="button"
                className="group grid w-full grid-cols-[50px_minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 py-3 text-left transition-colors last:border-b-0 hover:bg-[#fffdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
              >
                <span className="relative flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-[#d8dee8] bg-white text-[#8a95a6] transition-colors group-hover:border-[#f7a81b]">
                  <Icon icon="lucide:image" width={20} height={20} aria-hidden="true" />
                  <span className="absolute bottom-1 right-1 rounded-[4px] bg-white px-1 font-poppins text-[9px] font-semibold text-[#17458f] shadow-[0_1px_4px_rgba(15,23,42,0.12)]">
                    x{item.qty}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-poppins text-[13px] font-semibold text-black group-hover:text-[#17458f]">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block font-poppins text-[12px] text-[#6b7280]">{item.variant}</span>
                </span>
                <span className="whitespace-nowrap text-right font-poppins text-[13px] font-semibold text-black">
                  {item.price}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <div className="mb-2 flex items-center justify-between font-poppins">
              <span className="text-[11px] font-medium text-[#6b7280]">Estimasi subtotal</span>
              <span className="text-[14px] font-semibold text-black">Rp. 805.000</span>
            </div>
            <button
              type="button"
              className="h-9 w-full rounded-lg bg-[#f7a81b] font-poppins text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(247,168,27,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
            >
              Checkout Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
