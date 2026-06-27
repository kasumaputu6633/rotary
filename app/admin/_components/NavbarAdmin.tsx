"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import NavbarSearch from "@/app/_components/NavbarSearch";
import { logoutAction } from "@/app/actions";

interface NavbarAdminProps {
    user: {
        id: string;
        fullName: string | null;
        email: string | null;
        avatarUrl: string | null;
        role: string;
    };
    onMenuToggle: () => void;
}

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export default function NavbarAdmin({ user, onMenuToggle }: NavbarAdminProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        startTransition(() => {
            logoutAction();
        });
    }

    const adminName = user.fullName || "Rotary Admin";

    return (
        <>
            <header className="sticky top-0 z-[40] w-full border-b border-[#eef2f6] bg-white/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    {/* Left section: Hamburger & Branding */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuToggle}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 lg:hidden focus:outline-none"
                            aria-label="Toggle Sidebar"
                        >
                            <Icon icon="lucide:menu" width={20} height={20} />
                        </button>

                        <Link href="/admin/dashboard" className="flex items-center gap-2 md:gap-3">
                            <Image
                                src="/rotary-logo.png"
                                alt="Rotary"
                                width={90}
                                height={32}
                                priority
                                className="h-auto w-16 md:w-20 shrink-0"
                            />
                            <Image
                                src="/pnb.svg"
                                alt="PNB"
                                width={32}
                                height={32}
                                priority
                                className="h-6 w-6 md:h-8 md:w-8 shrink-0"
                            />
                        </Link>
                    </div>

                    {/* Middle section: Search Bar */}
                    <div className="hidden max-w-md flex-1 px-4 sm:block md:max-w-lg lg:max-w-xl">
                        <NavbarSearch />
                    </div>

                    {/* Right section: Profile Dropdown */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[#fff9f0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f7a81b]/50"
                            >
                                {/* Avatar */}
                                {user.avatarUrl ? (
                                    <Image
                                        src={user.avatarUrl}
                                        alt={adminName}
                                        width={36}
                                        height={36}
                                        className="h-9 w-9 rounded-full object-cover border border-[#f7a81b]"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#f7a81b] to-[#e89a14] font-open-sauce text-xs font-semibold text-white shadow-sm">
                                        {getInitials(adminName)}
                                    </div>
                                )}

                                {/* Profile Text */}
                                <div className="hidden text-left md:block">
                                    <p className="font-open-sauce text-xs font-semibold text-gray-900 truncate max-w-[120px]">
                                        {adminName}
                                    </p>
                                    <p className="font-open-sauce text-[10px] text-gray-500 font-medium -mt-0.5">
                                        Administrator
                                    </p>
                                </div>

                                <Icon
                                    icon="lucide:chevron-down"
                                    width={14}
                                    height={14}
                                    className={`text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gray-100 bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150"
                                >
                                    <div className="border-b border-gray-100 px-3 py-2 pb-3 mb-2">
                                        <p className="font-open-sauce text-xs font-semibold text-gray-900">
                                            {adminName}
                                        </p>
                                        <p className="font-open-sauce text-[11px] text-gray-400 truncate mt-0.5">
                                            {user.email || "admin@rotary.com"}
                                        </p>
                                    </div>

                                    <Link
                                        href="/admin/dashboard"
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-open-sauce text-[13px] text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                                    >
                                        <Icon icon="lucide:home" width={16} height={16} className="text-gray-400" />
                                        <span>Halaman Utama</span>
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            setShowLogoutModal(true);
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-open-sauce text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Icon icon="lucide:log-out" width={16} height={16} />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar on Mobile */}
                <div className="border-t border-[#eef2f6] px-4 py-2 sm:hidden bg-white">
                    <NavbarSearch />
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setShowLogoutModal(false)}
                    />
                    <div
                        className="relative bg-white rounded-2xl shadow-xl px-6 py-6 flex flex-col items-center gap-4 w-[340px] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                            <Icon icon="lucide:log-out" width={24} height={24} className="text-red-500" />
                        </div>

                        <div className="text-center">
                            <h3 className="font-open-sauce font-semibold text-[16px] text-gray-900">
                                Keluar dari Admin Panel?
                            </h3>
                            <p className="font-open-sauce text-[12px] text-gray-500 mt-1">
                                Anda harus masuk kembali untuk mengelola dashboard admin.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full mt-2">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                disabled={isPending}
                                className="flex-1 font-open-sauce font-semibold text-[13px] text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isPending}
                                className="flex-1 font-open-sauce font-semibold text-[13px] text-white bg-red-600 rounded-xl py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isPending ? (
                                    <Icon icon="lucide:loader-2" className="animate-spin" width={14} height={14} />
                                ) : (
                                    "Ya, Keluar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}