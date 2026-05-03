"use client";

export default function NavbarSearch() {
  return (
    <div className="w-full flex items-center h-10 bg-white border border-[#c5cbd6] rounded-xl overflow-hidden transition-colors focus-within:border-[#f7a81b]">
      <input
        type="text"
        placeholder="Cari di Marketplace"
        className="flex-1 px-4 font-poppins text-[13px] text-gray-700 placeholder:text-[#9ca3af] outline-none bg-transparent min-w-0"
      />
      <button
        type="button"
        className="h-full w-13 bg-[#f7a81b] hover:bg-[#e09918] transition-colors flex items-center justify-center shrink-0"
        aria-label="Cari"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
