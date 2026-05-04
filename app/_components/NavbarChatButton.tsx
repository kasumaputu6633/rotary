"use client";

import { Icon } from "@iconify/react";

export default function NavbarChatButton() {
  function handleOpenChat() {
    window.dispatchEvent(new CustomEvent("rotaryOpenChat"));
  }

  return (
    <button
      type="button"
      onClick={handleOpenChat}
      className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
      aria-label="Chat"
    >
      <Icon icon="lucide:messages-square" width={21} height={21} className="text-[#555]" aria-hidden="true" />
      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ef476f] font-poppins text-[8px] font-bold text-white">
        1
      </span>
    </button>
  );
}
