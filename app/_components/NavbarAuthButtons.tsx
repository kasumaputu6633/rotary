"use client";

import { Icon } from "@iconify/react";
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
          <Icon icon="lucide:log-out" width={28} height={28} className="text-[#f7a81b]" aria-hidden="true" />
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
        <div className="flex items-center gap-2 md:gap-3">
          {isUser && (
            <Link
              href="/dashboard/listings/new"
              className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f7a81b] font-poppins text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(247,168,27,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e09918] hover:shadow-[0_10px_20px_rgba(247,168,27,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2 whitespace-nowrap md:h-9 md:w-auto md:gap-2 md:px-4 md:text-[13px]"
              aria-label="Jual Barang"
            >
              <Icon icon="lucide:plus-circle" width={15} height={15} className="transition-transform group-hover:rotate-90" aria-hidden="true" />
              <span className="hidden md:inline">Jual Barang</span>
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
              <span className="hidden font-poppins font-semibold text-[13px] text-[#555] whitespace-nowrap max-w-22.5 truncate md:inline">
                {firstName}
              </span>
              <Icon
                icon="lucide:chevron-down"
                width={12}
                height={12}
                className="hidden text-[#555] md:block"
                aria-hidden="true"
                style={{
                  transition: 'transform 0.3s ease-in-out',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
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
                  <Link
                    href="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <Icon icon="lucide:user" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Profil Saya
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/listings"
                    onClick={() => setShowDropdown(false)}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <Icon icon="lucide:file-text" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Listing Saya
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to change password page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <Icon icon="lucide:user-cog" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Ubah Password
                    </span>
                  </button>

                  <Link
                    href="/dashboard/favorites"
                    onClick={() => setShowDropdown(false)}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <Icon icon="lucide:heart" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                    <span className="font-poppins text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      Favorit
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navigate to help center page
                    }}
                    className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none transition-colors"
                  >
                    <Icon icon="lucide:circle-help" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
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
                    <Icon icon="lucide:log-out" width={16} height={16} className="text-red-500" aria-hidden="true" />
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
    <div className="flex items-center gap-2 md:gap-3">
      <Link
        href="/login?redirect=/dashboard/listings/new"
        className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f7a81b] font-poppins text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(247,168,27,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e09918] hover:shadow-[0_10px_20px_rgba(247,168,27,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2 whitespace-nowrap md:h-9 md:w-auto md:gap-2 md:px-4 md:text-[13px]"
        aria-label="Jual Barang"
      >
        <Icon icon="lucide:plus-circle" width={15} height={15} className="transition-transform group-hover:rotate-90" aria-hidden="true" />
        <span className="hidden md:inline">Jual Barang</span>
      </Link>
      <Link
        href="/login"
        className="inline-flex h-8 items-center rounded-full border border-[#f7a81b] px-3 font-poppins text-[12px] font-semibold text-[#f7a81b] transition-colors hover:bg-[#fff8ec] whitespace-nowrap md:h-9 md:px-5 md:text-[13px]"
      >
        <span className="hidden sm:inline">Register/Masuk</span>
        <span className="sm:hidden">Masuk</span>
      </Link>
    </div>
  );
}
