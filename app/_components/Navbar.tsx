import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import NavbarSearch from "./NavbarSearch";
import NavbarAuthButtons from "./NavbarAuthButtons";
import NavbarCartButton from "./NavbarCartButton";
import NavbarChatButton from "./NavbarChatButton";
import NavbarNotificationButton from "./NavbarNotificationButton";

const topLinks = ["Tentang Rotary", "Edukasi", "Program", "Bantuan"];

const navLinks = [
  { label: "Marketplace", href: "/" },
  { label: "Donasi", href: "#" },
  { label: "Lokasi Penampung", href: "/waste" },
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
      <div className="px-4 md:px-8">
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

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 py-3 md:h-16 md:grid-cols-[144px_72px_minmax(220px,1fr)_auto] md:gap-x-5 md:py-0">
          <Link href="/" className="flex min-w-0 items-center gap-2 shrink-0 md:gap-2.5">
            <Image
              src="/rotary-logo.png"
              alt="Rotary"
              width={96}
              height={36}
              priority
              sizes="96px"
              className="h-auto w-20 shrink-0 sm:w-24"
            />
            <Image
              src="/pnb.svg"
              alt="PNB"
              width={38}
              height={38}
              priority
              sizes="38px"
              className="h-7 w-7 shrink-0 sm:h-8 sm:w-8 md:h-[38px] md:w-[38px]"
            />
          </Link>

          <Link
            href="#"
            className="hidden lg:inline-flex font-poppins text-[14px] text-[#333] hover:text-[#17458f] transition-colors whitespace-nowrap"
          >
            Kategori
          </Link>

          <div className="col-span-2 row-start-2 flex items-center md:col-span-1 md:col-start-3 md:row-auto">
            <div className="w-full max-w-[860px]">
              <NavbarSearch />
            </div>
          </div>

          <div className="col-start-2 row-start-1 flex min-w-0 items-center gap-2 justify-end md:col-start-4 md:row-auto md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="hidden md:block">
                <NavbarChatButton />
              </div>

              <NavbarNotificationButton />

              <NavbarCartButton />
            </div>

            <NavbarAuthButtons userName={userName} userRole={userRole} />
          </div>
        </div>

        <div className="-mx-4 h-10 overflow-x-auto border-t border-gray-100 md:mx-0 md:h-9 md:grid md:grid-cols-[144px_72px_minmax(220px,1fr)_auto] md:items-center md:gap-x-5 md:overflow-hidden">
          <div className="hidden md:block" />
          <div className="hidden md:block" />
          <nav className="flex h-full min-w-max items-center gap-7 px-4 md:gap-8 md:overflow-hidden md:px-0" aria-label="Navigasi utama">
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
