"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions";

export default function NavbarAuthButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (isLoggedIn) {
    return (
      <button
        onClick={() => startTransition(() => logoutAction())}
        disabled={isPending}
        className="font-poppins font-semibold text-[14px] text-[#f7a81b] border-2 border-[#f7a81b] rounded-[20px] px-6 py-2 hover:bg-[#fff8ec] transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Keluar"}
      </button>
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
