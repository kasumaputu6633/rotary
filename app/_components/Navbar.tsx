import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import NavbarSearch from "./NavbarSearch";
import NavbarAuthButtons from "./NavbarAuthButtons";

const topLinks = ["Tentang Rotary", "Edukasi", "Program", "Bantuan"];

const navLinks = [
  { label: "Marketplace", href: "/" },
  { label: "Donasi", href: "#" },
  { label: "Tempat Sampah", href: "/waste" },
  { label: "Program Komunitas", href: "#" },
  { label: "Customer Service", href: "#" },
];

export default async function Navbar() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value ?? null;

  let userName: string | null = null;
  let userRole: string | null = null;
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { name: true, role: true },
    });
    userName = user?.name ?? null;
    userRole = user?.role ?? null;
  }

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-[960]">
      <div className="px-8">
        <div className="hidden h-8 items-center justify-between border-b border-gray-100 md:flex">
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3v18M5 8.5c0-2.2 1.8-4 4-4h6.5A3.5 3.5 0 0119 8v0a3.5 3.5 0 01-3.5 3.5H12M19 15.5c0 2.2-1.8 4-4 4H8.5A3.5 3.5 0 015 16v0a3.5 3.5 0 013.5-3.5H12"
                stroke="#f7a81b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-poppins text-[12px] text-[#6b7280]">
              Dukung sirkular ekonomi Bali
            </p>
          </div>

          <nav className="flex items-center gap-7" aria-label="Navigasi tambahan">
            {topLinks.map((link) => (
              <Link
                key={link}
                href="#"
                className="font-poppins text-[12px] text-[#6b7280] hover:text-[#17458f] transition-colors whitespace-nowrap"
              >
                {link}
              </Link>
            ))}
          </nav>
        </div>

        <div className="h-16 grid grid-cols-[144px_72px_minmax(220px,1fr)_auto] items-center gap-x-5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/rotary-logo.png"
              alt="Rotary"
              width={96}
              height={36}
              priority
              sizes="96px"
              className="h-auto w-24"
            />
            <Image
              src="/pnb.svg"
              alt="PNB"
              width={38}
              height={38}
              priority
              sizes="38px"
              className="h-[38px] w-[38px]"
            />
          </Link>

          <Link
            href="#"
            className="hidden lg:inline-flex font-poppins text-[14px] text-[#333] hover:text-[#17458f] transition-colors whitespace-nowrap"
          >
            Kategori
          </Link>

          <div className="flex items-center">
            <div className="w-full max-w-[860px]">
            <NavbarSearch />
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end">
            <div className="hidden xl:flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 13 16" fill="none" aria-hidden="true">
                <path
                  d="M6.5 0C4.01 0 2 2.01 2 4.5c0 3.37 4.5 9.5 4.5 9.5S11 7.87 11 4.5C11 2.01 8.99 0 6.5 0zm0 6.5C5.4 6.5 4.5 5.6 4.5 4.5S5.4 2.5 6.5 2.5 8.5 3.4 8.5 4.5 7.6 6.5 6.5 6.5z"
                  fill="#f7a81b"
                />
              </svg>
              <div>
                <p className="font-poppins text-[10px] text-[#9ca3af] leading-none whitespace-nowrap">
                  Dikirim ke
                </p>
                <p className="font-poppins text-[12px] font-semibold text-[#6b7280] leading-tight whitespace-nowrap">
                  Denpasar Barat
                </p>
              </div>
            </div>

            <div className="hidden xl:block w-px h-7 bg-gray-200 shrink-0" />

            <button type="button" className="relative p-1 shrink-0" aria-label="Notifikasi">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke="#555"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button type="button" className="relative p-1 shrink-0" aria-label="Keranjang">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke="#555"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 bg-[#f7a81b] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center font-poppins">
                0
              </span>
            </button>

            <NavbarAuthButtons userName={userName} userRole={userRole} />
          </div>
        </div>

        <div className="h-9 grid grid-cols-[144px_72px_minmax(220px,1fr)_auto] items-center gap-x-5 border-t border-gray-100">
          <div />
          <div />
          <nav className="flex items-center gap-8 overflow-hidden" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-poppins text-[13px] text-[#8f8a8a] hover:text-[#17458f] transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div />
        </div>
      </div>
    </header>
  );
}
