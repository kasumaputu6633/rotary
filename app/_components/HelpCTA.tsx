"use client";

import { Icon } from "@iconify/react";

interface HelpCTAProps {
  title?: string;
  description?: string;
  email?: string;
  buttonText?: string;
}

export default function HelpCTA({
  title = "Butuh bantuan lebih lanjut?",
  description = "Tim layanan pelanggan kami siap menjawab pertanyaan dan membantu menyelesaikan kendala kamu.",
  email = "support@rotary.id",
  buttonText = "Hubungi Kami",
}: HelpCTAProps) {
  return (
    <div className="mt-14 rounded-2xl border border-[#17458f]/20 bg-linear-to-br from-[#eef2fb] to-[#f0f7ff] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#17458f]">
        <Icon icon="lucide:mail" width={22} height={22} className="text-white" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-open-sauce text-[17px] font-bold text-[#171717]">
        {title}
      </h3>
      <p className="mt-2 font-open-sauce text-[13px] leading-relaxed text-[#5f6370]">
        {description}
      </p>
      <a
        href={`mailto:${email}`}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17458f] px-6 font-open-sauce text-[13px] font-semibold text-white shadow-md shadow-[#17458f]/20 transition-all hover:-translate-y-0.5 hover:bg-[#123a79] hover:shadow-lg"
      >
        <Icon icon="lucide:send" width={15} height={15} aria-hidden="true" />
        {buttonText}
      </a>
    </div>
  );
}
