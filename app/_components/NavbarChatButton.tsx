"use client";

import { Icon } from "@iconify/react";
import { useUnreadCount } from "@/app/_features/chat/hooks/useUnreadCount";

export default function NavbarChatButton() {
  const { count } = useUnreadCount();

  function handleOpenChat() {
    window.dispatchEvent(new CustomEvent("rotaryOpenChat"));
  }

  return (
    <button
      type="button"
      onClick={handleOpenChat}
      className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2"
      aria-label={count > 0 ? `Chat (${count} belum dibaca)` : "Chat"}
    >
      <Icon icon="lucide:messages-square" width={21} height={21} className="text-[#555]" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#ef476f] font-poppins text-[8px] font-bold text-white px-0.5">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
