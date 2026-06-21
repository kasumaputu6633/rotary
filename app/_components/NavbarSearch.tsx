"use client";

import { Icon } from "@iconify/react";

export default function NavbarSearch() {
  return (
    <form action="/products" className="w-full flex items-center h-10 bg-white border border-[#c5cbd6] rounded-xl overflow-hidden transition-colors focus-within:border-[#f7a81b]">
      <input
        name="q"
        type="text"
        placeholder="Cari di Marketplace"
        className="flex-1 px-4 font-poppins text-[13px] text-gray-700 placeholder:text-[#9ca3af] outline-none bg-transparent min-w-0"
      />
      <button
        type="submit"
        className="h-full w-13 bg-[#f7a81b] hover:bg-[#e09918] transition-colors flex items-center justify-center shrink-0"
        aria-label="Cari"
      >
        <Icon icon="lucide:search" width={15} height={15} className="text-white" aria-hidden="true" />
      </button>
    </form>
  );
}
