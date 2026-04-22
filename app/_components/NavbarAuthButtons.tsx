"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function NavbarAuthButtons({ userName }: { userName: string | null }) {
  const [isPending, startTransition] = useTransition();

  if (userName) {
    const firstName = userName.trim().split(/\s+/)[0];
    return (
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
          onClick={() => startTransition(() => logoutAction())}
          disabled={isPending}
          className="font-poppins font-semibold text-[14px] text-[#f7a81b] border-2 border-[#f7a81b] rounded-[20px] px-6 py-2 hover:bg-[#fff8ec] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? "..." : "Keluar"}
        </button>
      </div>
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
