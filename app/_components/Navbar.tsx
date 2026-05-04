import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
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
            <Icon icon="lucide:recycle" width={13} height={13} className="text-[#f7a81b]" aria-hidden="true" />
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
              <Icon icon="lucide:map-pin" width={14} height={14} className="text-[#f7a81b]" aria-hidden="true" />
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
              <Icon icon="lucide:bell" width={21} height={21} className="text-[#555]" aria-hidden="true" />
            </button>

            <button type="button" className="relative p-1 shrink-0" aria-label="Keranjang">
              <Icon icon="lucide:shopping-bag" width={21} height={21} className="text-[#555]" aria-hidden="true" />
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
