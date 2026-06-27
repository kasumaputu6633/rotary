import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-center w-full py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/rotary-logo.png"
            alt="Rotary"
            width={138}
            height={50}
            style={{ width: 138, height: 50 }}
            className="object-contain"
            priority
          />
          <Image
            src="/pnb.svg"
            alt="PNB"
            width={47}
            height={47}
            style={{ width: 47, height: 47 }}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5">
        {children}
      </main>

      <footer className="border-t border-[#676767] py-5 flex flex-col items-center gap-3">
        <div className="flex gap-[22px] items-center justify-center font-open-sauce text-[12px] text-[#505050]">
          <Link href="/terms">Ketentuan Penggunaan</Link>
          <Link href="/privacy">Pemberitahuan Privasi</Link>
          <Link href="/help">Bantuan</Link>
        </div>
        <p className="font-open-sauce text-[12px] text-[#656565]">
          © 2026 Rotary International. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
