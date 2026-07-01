"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState, useTransition, useRef, useEffect } from "react";
import { logoutAction } from "@/app/actions";
import { ConfirmDialog } from "./ConfirmDialog";
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function NavbarAuthButtons({
  userAvatarUrl,
  userShopName,
  userFullName,
  userRole,
}: {
  userAvatarUrl: string | null;
  userShopName: string | null;
  userFullName: string | null;
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

  const resolvedShopName =
    userShopName?.trim()
    || userFullName?.trim()
    || (userRole ? "Pengguna Rotary" : "");

  if (resolvedShopName) {
    const isUser = userRole === "user";
    const profileHref = isUser ? "/account/settings" : "/admin/dashboard";

    return (
      <>
        <ConfirmDialog
          isOpen={showModal}
          title="Keluar dari akun?"
          description="Sesi kamu akan diakhiri. Kamu perlu masuk kembali untuk mengakses Seller Center dan mengelola listing."
          icon="lucide:log-out"
          tone="accent"
          confirmLabel="Ya, Keluar"
          pendingLabel="Keluar..."
          isPending={isPending}
          onConfirm={handleLogout}
          onCancel={() => setShowModal(false)}
        />
        <div className="flex items-center gap-2 md:gap-3">
          {isUser && (
            <Link
              href="/dashboard/listings/new"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f7a81b] font-open-sauce text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(247,168,27,0.22)] transition-all hover:bg-[#e09918] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2 whitespace-nowrap md:w-auto md:gap-2 md:px-4 md:text-[13px]"
              aria-label="Jual Barang"
            >
              <Icon icon="lucide:plus-circle" width={15} height={15} className="transition-transform group-hover:rotate-90" aria-hidden="true" />
              <span className="hidden md:inline">Jual Barang</span>
            </Link>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex min-h-11 items-center gap-2 rounded-lg px-1 transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
              aria-label={`Buka menu akun ${resolvedShopName}`}
              aria-expanded={showDropdown}
              aria-haspopup="menu"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f7a81b]">
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-open-sauce text-[11px] font-bold leading-none text-white">
                    {getInitials(resolvedShopName)}
                  </span>
                )}
              </div>
              <span className="hidden max-w-24 truncate whitespace-nowrap font-open-sauce text-[13px] font-semibold text-[#555] xl:inline">
                {resolvedShopName}
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
                className="fixed z-[9999] w-64 overflow-hidden rounded-lg border border-gray-200 bg-white animate-[dropdownSlideIn_180ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
                role="menu"
                style={{
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  boxShadow: '0 18px 44px rgba(23, 69, 143, 0.18), 0 8px 22px rgba(0, 0, 0, 0.16)',
                }}
              >
                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f7a81b]">
                      {userAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-open-sauce text-[13px] font-bold leading-none text-white">
                          {getInitials(resolvedShopName)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-open-sauce font-semibold text-[14px] text-black truncate">
                        {resolvedShopName}
                      </p>
                      {userFullName && userFullName !== resolvedShopName ? (
                        <p className="mt-0.5 truncate font-open-sauce text-[11px] text-[#6b7280]">{userFullName}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href={profileHref}
                    onClick={() => setShowDropdown(false)}
                    className="group flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none"
                    role="menuitem"
                  >
                    <Icon icon="lucide:user" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                    <span className="font-open-sauce text-[13px] text-[#333] group-hover:text-[#17458f] group-hover:font-semibold transition-colors">
                      {isUser ? "Akun Saya" : "Dashboard Admin"}
                    </span>
                  </Link>

                  {isUser ? (
                    <Link
                      href="/account/favorites"
                      onClick={() => setShowDropdown(false)}
                      className="group flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none"
                      role="menuitem"
                    >
                      <Icon icon="lucide:heart" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                      <span className="font-open-sauce text-[13px] text-[#333] transition-colors group-hover:font-semibold group-hover:text-[#17458f]">
                        Favorit
                      </span>
                    </Link>
                  ) : null}

                  <Link
                    href="/account/settings?tab=security"
                    onClick={() => setShowDropdown(false)}
                    className="group flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none"
                    role="menuitem"
                  >
                    <Icon icon="lucide:shield-check" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                    <span className="font-open-sauce text-[13px] text-[#333] transition-colors group-hover:font-semibold group-hover:text-[#17458f]">
                      Keamanan Akun
                    </span>
                  </Link>

                  <div className="border-t border-gray-100">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="group flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fff7e8] focus-visible:bg-[#fff7e8] focus-visible:outline-none"
                      role="menuitem"
                    >
                      <Icon icon="lucide:store" width={16} height={16} className="text-[#555] transition-colors group-hover:text-[#17458f]" aria-hidden="true" />
                      <span className="font-open-sauce text-[13px] text-[#333] transition-colors group-hover:font-semibold group-hover:text-[#17458f]">
                        Seller Center
                      </span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowModal(true);
                    }}
                    className="group flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
                    role="menuitem"
                  >
                    <Icon icon="lucide:log-out" width={16} height={16} className="text-red-500" aria-hidden="true" />
                    <span className="font-open-sauce text-[13px] text-red-500 font-medium">
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
        className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f7a81b] font-open-sauce text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(247,168,27,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e09918] hover:shadow-[0_10px_20px_rgba(247,168,27,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2 whitespace-nowrap md:h-9 md:w-auto md:gap-2 md:px-4 md:text-[13px]"
        aria-label="Jual Barang"
      >
        <Icon icon="lucide:plus-circle" width={15} height={15} className="transition-transform group-hover:rotate-90" aria-hidden="true" />
        <span className="hidden md:inline">Jual Barang</span>
      </Link>
      <Link
        href="/login"
        className="inline-flex h-8 items-center rounded-full border border-[#f7a81b] px-3 font-open-sauce text-[12px] font-semibold text-[#f7a81b] transition-colors hover:bg-[#fff8ec] whitespace-nowrap md:h-9 md:px-5 md:text-[13px]"
      >
        <span className="hidden sm:inline">Register/Masuk</span>
        <span className="sm:hidden">Masuk</span>
      </Link>
    </div>
  );
}
