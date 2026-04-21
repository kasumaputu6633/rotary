import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import NavbarSearch from "./NavbarSearch";
import NavbarAuthButtons from "./NavbarAuthButtons";

const navLinks = ["Kategori", "Belanja", "Donasi", "About Us", "Customer Service"];

export default async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("session_user_id")?.value;

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="grid grid-cols-[auto_1fr_auto] px-8 gap-x-5 pt-1">

        <Link href="/" className="h-18 flex items-center shrink-0">
          <Image
            src="/rotary-logo.png"
            alt="Rotary"
            width={110}
            height={42}
            priority
            sizes="110px"
          />
        </Link>

        <div className="h-18 flex items-center px-28">
          <NavbarSearch />
        </div>

        <div className="h-18 flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
              <path
                d="M6.5 0C4.01 0 2 2.01 2 4.5c0 3.37 4.5 9.5 4.5 9.5S11 7.87 11 4.5C11 2.01 8.99 0 6.5 0zm0 6.5C5.4 6.5 4.5 5.6 4.5 4.5S5.4 2.5 6.5 2.5 8.5 3.4 8.5 4.5 7.6 6.5 6.5 6.5z"
                fill="#f7a81b"
              />
            </svg>
            <div>
              <p className="font-poppins text-[10px] text-[#968e8e] leading-none whitespace-nowrap">
                Dikirim ke
              </p>
              <p className="font-poppins text-[12px] font-semibold text-[#968e8e] leading-tight whitespace-nowrap">
                Denpasar Barat
              </p>
            </div>
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          <button type="button" className="relative p-1 shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                stroke="#555"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 bg-[#f7a81b] text-white text-[8px] font-bold rounded-full w-[14px] h-[14px] flex items-center justify-center font-poppins">
              0
            </span>
          </button>

          <NavbarAuthButtons isLoggedIn={isLoggedIn} />
        </div>

        <div className="border-t border-gray-100" />

        <div className="h-[44px] flex items-center justify-start border-t border-gray-100 px-28">
          {navLinks.flatMap((link, i) => {
            const cell = (
              <Link
                key={link}
                href="#"
                className="font-poppins text-[13px] text-[#968e8e] hover:text-[#17458f] transition-colors px-5 whitespace-nowrap"
              >
                {link}
              </Link>
            );
            if (i === 0) return [cell];
            return [<div key={`div-${i}`} className="w-px h-5 bg-[#f7a81b] shrink-0" />, cell];
          })}
        </div>

        <div className="border-t border-gray-100" />
      </div>
    </header>
  );
}
