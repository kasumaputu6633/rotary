"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
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

export default function NavbarAuthButtons({ userName }: { userName: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  function handleLogout() {
    startTransition(() => logoutAction());
  }

  if (userName) {
    const firstName = userName.trim().split(/\s+/)[0];
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f7a81b] flex items-center justify-center shrink-0">
              <span className="font-poppins font-bold text-[11px] text-white leading-none">
                {getInitials(userName)}
              </span>
            </div>
            <span className="font-poppins font-semibold text-[13px] text-[#555] whitespace-nowrap max-w-22.5 truncate">
              {firstName}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={isPending}
            className="font-poppins font-semibold text-[14px] text-[#f7a81b] border-2 border-[#f7a81b] rounded-[20px] px-6 py-2 hover:bg-[#fff8ec] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Keluar
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="font-poppins font-semibold text-[14px] text-[#f7a81b] border-2 border-[#f7a81b] rounded-[20px] px-6 py-2 hover:bg-[#fff8ec] transition-colors whitespace-nowrap"
      >
        Masuk
      </Link>
      <Link
        href="/register"
        className="font-poppins font-semibold text-[14px] text-white bg-[#f7a81b] rounded-[20px] px-6 py-2 hover:bg-[#e09918] transition-colors whitespace-nowrap"
      >
        Daftar
      </Link>
    </div>
  );
}
