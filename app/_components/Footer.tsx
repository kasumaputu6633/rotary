import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const siteMapLinks = [
  "Tentang Rotary",
  "Contact Us",
  "Dampak Kami",
  "Program Kami",
];

const legalLinks = [
  "Hak Kekayaan Intelektual",
  "Terms of Services",
  "Privacy Policy",
];

const socialIcons = [
  {
    label: "Twitter / X",
    icon: "simple-icons:x",
  },
  {
    label: "Facebook",
    icon: "simple-icons:facebook",
  },
  {
    label: "Instagram",
    icon: "simple-icons:instagram",
  },
  {
    label: "YouTube",
    icon: "simple-icons:youtube",
  },
  {
    label: "LinkedIn",
    icon: "simple-icons:linkedin",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      <div className="h-px w-full bg-[#bfc7d4] shadow-[0_1px_2px_rgba(15,23,42,0.14)]" aria-hidden="true" />
      <div className="mx-auto max-w-[1728px] px-8 py-8 lg:px-40">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-[430px]">
            <div className="flex items-center gap-5">
              <Image
                src="/rotary-logo.png"
                alt="Rotary"
                width={104}
                height={39}
                sizes="104px"
                className="h-auto w-[104px]"
              />
              <Image
                src="/pnb.svg"
                alt="PNB"
                width={39}
                height={39}
                sizes="39px"
                className="h-[39px] w-[39px]"
              />
            </div>

            <p className="mt-7 max-w-[400px] font-poppins text-[16px] leading-[1.42] text-black">
              Lorem ipsum urna enim sapiensdsa vestibulum sed turpis at sed faucibus magna porta quis feugiat potenti.
            </p>

            <div className="mt-7 flex items-center gap-4.5">
              {socialIcons.map((icon) => (
                <a
                  key={icon.label}
                  href="#"
                  aria-label={icon.label}
                  className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-[#242424] text-black transition-colors hover:border-[#17458f] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4"
                >
                  <Icon icon={icon.icon} width={13} height={13} aria-hidden="true" />
                </a>
              ))}
            </div>

            <a
              href="#"
              className="mt-9 inline-flex h-9.5 items-center gap-3 border border-[#f7a81b] px-3.5 pr-5 font-poppins text-[12px] font-semibold text-black transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-4"
            >
              <Icon icon="lucide:chevrons-up" width={18} height={18} aria-hidden="true" />
              BACK TO TOP
            </a>
          </div>

          <div className="grid gap-10 pt-5 sm:grid-cols-[minmax(160px,1fr)_minmax(220px,1fr)] sm:gap-16 lg:w-[620px] lg:gap-24 lg:pt-5">
            <div>
              <h2 className="font-poppins text-[14px] font-semibold text-black">Site Map</h2>
              <nav className="mt-7 flex flex-col gap-6" aria-label="Site Map">
                {siteMapLinks.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="font-poppins text-[14px] text-black transition-colors hover:text-[#17458f]"
                  >
                    {link}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h2 className="font-poppins text-[14px] font-semibold text-black">Legal</h2>
              <nav className="mt-7 flex flex-col gap-6" aria-label="Legal">
                {legalLinks.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="font-poppins text-[14px] text-black transition-colors hover:text-[#17458f]"
                  >
                    {link}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-[#8d8d8d] pt-5 text-center">
          <p className="font-poppins text-[12px] text-black">
            © 2026 Rotary International. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
