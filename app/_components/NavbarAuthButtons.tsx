"use client";

import Link from "next/link";
import { useState, useTransition, useRef, useEffect } from "react";
import { logoutAction } from "@/app/actions";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function LogoutModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className="relative bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center gap-5 w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-[#fff8ec] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="#f7a81b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="font-poppins font-semibold text-[16px] text-black">
            Keluar dari akun?
          </p>
          <p className="font-poppins text-[13px] text-[#968e8e] mt-1">
            Anda harus masuk kembali untuk mengakses akun Anda.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 font-poppins font-semibold text-[14px] text-[#555] border-2 border-gray-200 rounded-[20px] py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] py-2 hover:bg-[#e09918] transition-colors disabled:opacity-50"
          >
            {isPending ? "..." : "Ya, Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NavbarAuthButtons({
  userName,
  userRole,
}: {
  userName: string | null;
  userRole: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  function handleLogout() {
    startTransition(() => logoutAction());
  }

  // Position dropdown and manage scroll/overlay
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
      setIsPositioned(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsPositioned(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showDropdown]);

  // Close dropdown on outside click
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

  // Dispatch event to show/hide overlay
  useEffect(() => {
    const event = new CustomEvent('profileDropdownToggle', { detail: { isOpen: showDropdown } });
    window.dispatchEvent(event);
  }, [showDropdown]);

  if (userName) {
    const firstName = userName.trim().split(/\s+/)[0];
    const isUser = userRole === "user";

    return (
      <>
        {showModal && (
          <LogoutModal
            onConfirm={handleLogout}
            onCancel={() => setShowModal(false)}
            isPending={isPending}
          />
        )}
        <div className="flex items-center gap-3">
          {isUser && (
            <Link
              href="/jual"
              className="font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] px-5 py-2 hover:bg-[#e09918] transition-colors whitespace-nowrap"
            >
              + Jual
            </Link>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              ref={buttonRef}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#f7a81b] flex items-center justify-center shrink-0">
                <span className="font-poppins font-bold text-[11px] text-white leading-none">
                  {getInitials(userName)}
                </span>
              </div>
              <span className="font-poppins font-semibold text-[13px] text-[#555] whitespace-nowrap max-w-22.5 truncate">
                {firstName}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transition: 'transform 0.3s ease-in-out',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="#555"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>



            {/* Dropdown container */}
            {showDropdown && isPositioned && (
              <div
                className="fixed w-60 bg-white rounded-xl border border-gray-200/80 overflow-hidden z-[9999] animate-[dropdownSlideIn_180ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  boxShadow: '0 18px 44px rgba(23, 69, 143, 0.18), 0 8px 22px rgba(0, 0, 0, 0.16)',
                }}
              >
                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f7a81b] flex items-center justify-center shrink-0">
                      <span className="font-poppins font-bold text-[13px] text-white leading-none">
                        {getInitials(userName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-semibold text-[14px] text-black truncate">
                        {userName}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to profile page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Profil Saya
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to transaction history page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Riwayat Transaksi
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to my listings page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Listing Saya
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to change password page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Ubah Password
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to favorites page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Favorit
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to help center page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
                        className="stroke-[#555] group-hover:stroke-[#17458f] transition-colors"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Pusat Bantuan
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowModal(true);
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-poppins text-[13px] text-red-500 font-medium">
                      Keluar
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/jual"
        className="font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] px-5 py-2 hover:bg-[#e09918] transition-colors whitespace-nowrap"
      >
        + Jual
      </Link>
      <Link
        href="/login"
        className="font-poppins font-semibold text-[14px] text-[#f7a81b] border-2 border-[#f7a81b] rounded-[20px] px-6 py-2 hover:bg-[#fff8ec] transition-colors whitespace-nowrap"
      >
        Register/Masuk
      </Link>
    </div>
  );
}
