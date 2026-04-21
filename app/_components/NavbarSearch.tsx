"use client";

export default function NavbarSearch() {
  return (
    <div className="w-full flex items-center h-[42px] bg-white border border-[#a3a3a3] rounded-[20px] overflow-hidden">
      <input
        type="text"
        placeholder="Cari di Marketplace"
        className="flex-1 px-4 font-poppins text-[13px] text-gray-700 placeholder:text-[#b0b0b0] outline-none bg-transparent min-w-0"
      />
      <button
        type="button"
        className="h-full px-4 bg-[#f7a81b] hover:bg-[#e09918] transition-colors flex items-center justify-center shrink-0 rounded-r-[20px]"
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
