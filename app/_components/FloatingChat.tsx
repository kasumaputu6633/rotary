"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const conversations = [
  {
    id: "ayu",
    name: "Ayu Lestari",
    badge: "Penjual",
    lastMessage: "Barang masih ada, bisa chat dulu ya.",
    active: true,
    online: true,
  },
  {
    id: "made",
    name: "Made Wira",
    badge: "Pembeli",
    lastMessage: "Bisa ambil sore ini?",
    active: false,
    online: false,
  },
];

const quickReplies = [
  "Barang ini masih ada?",
  "Bisa atur temu hari ini?",
  "Bisa nego sedikit?",
];

const hiddenPathPrefixes = ["/login", "/register", "/forgot-password", "/unauthorized", "/dashboard", "/account"];

export default function FloatingChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLauncherLeaving, setIsLauncherLeaving] = useState(false);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const launcherTimerRef = useRef<number | null>(null);
  const panelTimerRef = useRef<number | null>(null);

  const shouldHide = hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix));

  const clearTimers = useCallback(() => {
    if (launcherTimerRef.current) window.clearTimeout(launcherTimerRef.current);
    if (panelTimerRef.current) window.clearTimeout(panelTimerRef.current);
  }, []);

  const openChat = useCallback(() => {
    clearTimers();
    setIsPanelClosing(false);
    setIsLauncherLeaving(true);
    launcherTimerRef.current = window.setTimeout(() => {
      setMobileView("list");
      setIsOpen(true);
      setIsLauncherLeaving(false);
    }, 170);
  }, [clearTimers]);

  const closeChat = useCallback(() => {
    clearTimers();
    setIsPanelClosing(true);
    panelTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsPanelClosing(false);
    }, 180);
  }, [clearTimers]);

  useEffect(() => {
    function handleOpenChat() {
      openChat();
    }

    window.addEventListener("rotaryOpenChat", handleOpenChat);
    return () => {
      window.removeEventListener("rotaryOpenChat", handleOpenChat);
      clearTimers();
    };
  }, [clearTimers, openChat]);

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-6 right-5 z-[9800] font-poppins md:bottom-16 md:right-24">
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className={`floating-chat-launcher group relative inline-flex h-12 items-center gap-2.5 rounded-full border border-[#d9e0ea] bg-white pl-3.5 pr-4 text-[#17458f] shadow-[0_10px_26px_rgba(15,23,42,0.18),0_4px_12px_rgba(23,69,143,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#f7a81b] hover:shadow-[0_14px_32px_rgba(15,23,42,0.22),0_6px_14px_rgba(247,168,27,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4 ${
            isLauncherLeaving ? "floating-chat-launcher-out" : ""
          }`}
          aria-label="Buka chat"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#f7a81b] text-white shadow-[0_5px_12px_rgba(247,168,27,0.28)] transition-all group-hover:scale-105 group-hover:bg-[#e89a14] group-hover:shadow-[0_7px_16px_rgba(247,168,27,0.34)]">
            <Icon icon="lucide:messages-square" width={19} height={19} aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef476f] text-[9px] font-bold text-white">
              1
            </span>
          </span>
          <span className="text-[14px] font-semibold">Chat</span>
        </button>
      )}

      {isOpen && (
        <section
          className={`floating-chat-panel fixed inset-x-4 bottom-4 grid h-[min(560px,calc(100dvh-32px))] w-auto overflow-hidden rounded-2xl border border-[#d9e0ea] bg-white shadow-[0_20px_52px_rgba(15,23,42,0.22),0_10px_22px_rgba(23,69,143,0.16)] md:static md:h-[min(540px,calc(100vh-90px))] md:w-[min(650px,calc(100vw-32px))] ${
            isPanelClosing ? "floating-chat-panel-out" : ""
          } md:grid-cols-[230px_minmax(0,1fr)]`}
          aria-label="Panel chat"
        >
          <aside className={`${mobileView === "list" ? "block" : "hidden"} border-r border-[#edf0f5] bg-white md:block`}>
            <div className="flex h-14 items-center justify-between border-b border-[#edf0f5] px-3.5">
              <h2 className="text-[18px] font-semibold text-black">Chat</h2>
              <div className="flex items-center gap-1 md:hidden">
                <button
                  type="button"
                  onClick={closeChat}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#fff7e8] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] md:hidden"
                  aria-label="Tutup chat"
                >
                  <Icon icon="lucide:chevron-down" width={21} height={21} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-2 p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setMobileView("thread")}
                  className={`grid w-full grid-cols-[38px_minmax(0,1fr)] items-center gap-2 rounded-xl p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] ${
                    conversation.active ? "bg-[#fff7e8]" : "hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[#17458f]">
                    <Icon icon="lucide:user-round" width={18} height={18} aria-hidden="true" />
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                        conversation.online ? "bg-[#48b461]" : "bg-[#9ca3af]"
                      }`}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold text-black">{conversation.name}</span>
                      <span className="rounded-md bg-[#fff1d6] px-1.5 py-0.5 text-[10px] font-semibold text-[#17458f]">
                        {conversation.badge}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#6b7280]">
                      {conversation.lastMessage}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className={`${mobileView === "thread" ? "grid" : "hidden"} min-w-0 grid-rows-[64px_minmax(0,1fr)_auto] md:grid`}>
            <header className="flex items-center justify-between gap-2 border-b border-[#edf0f5] px-3.5 md:px-5">
              <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#17458f] transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] md:hidden"
                  aria-label="Kembali ke daftar chat"
                >
                  <Icon icon="lucide:chevron-left" width={22} height={22} aria-hidden="true" />
                </button>
                <span className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[#17458f] sm:flex">
                  <Icon icon="lucide:user-round" width={18} height={18} aria-hidden="true" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#48b461]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[16px] font-semibold text-black">Ayu Lestari</h2>
                    <span className="rounded-md bg-[#fff1d6] px-2 py-1 text-[11px] font-semibold text-[#17458f]">
                      Penjual
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-[#6b7280]">Respons cepat</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  className="hidden h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#fff7e8] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] md:flex"
                  aria-label="Perbesar chat"
                >
                  <Icon icon="lucide:expand" width={18} height={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#fff7e8] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                  aria-label="Tutup chat"
                >
                  <Icon icon="lucide:chevron-down" width={21} height={21} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="min-h-0 overflow-y-auto bg-[#fbfcfe] px-4 py-3.5 md:px-5">
              <div className="mx-auto max-w-[420px]">
                <p className="mx-auto mb-4 w-fit rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#8a95a6] shadow-sm">
                  Hari ini
                </p>

                <div className="ml-auto max-w-[290px] rounded-[18px] rounded-tr-md bg-[#eef1f6] px-3.5 py-2.5 text-[13px] leading-snug text-black">
                  Halo kak, rak buku kayunya masih tersedia?
                  <div className="mt-1 text-right text-[11px] text-[#8a95a6]">10:24</div>
                </div>

                <div className="mt-3 max-w-[310px] rounded-[18px] rounded-tl-md border border-[#d9e0ea] bg-white px-3.5 py-2.5 text-[13px] leading-snug text-black shadow-sm">
                  Masih ada kak. Kondisi masih kuat, cocok untuk kamar atau ruang belajar.
                  <div className="mt-1 text-right text-[11px] text-[#8a95a6]">10:26</div>
                </div>

                <div className="mt-3 ml-auto max-w-[290px] rounded-[18px] rounded-tr-md bg-[#eef1f6] px-3.5 py-2.5 text-[13px] leading-snug text-black">
                  Bisa saya ambil sore ini? Lokasinya sekitar Denpasar Barat ya?
                  <div className="mt-1 text-right text-[11px] text-[#8a95a6]">10:28</div>
                </div>
              </div>
            </div>

            <footer className="border-t border-[#edf0f5] bg-white px-4 py-3 md:px-5">
              <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    className="shrink-0 rounded-full border border-[#f7a81b] px-3.5 py-1.5 text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-[1fr_44px] gap-2.5">
                <div className="flex h-[42px] items-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-3 transition-colors focus-within:border-[#f7a81b]">
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#17458f] transition-colors hover:bg-[#fff7e8]"
                    aria-label="Tambah lampiran"
                  >
                    <Icon icon="lucide:plus" width={18} height={18} aria-hidden="true" />
                  </button>
                  <input
                    type="text"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-[#b2b8c3]"
                    placeholder="Tulis pesan..."
                  />
                </div>
                <button
                  type="button"
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f7a81b] text-white shadow-[0_8px_18px_rgba(247,168,27,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2"
                  aria-label="Kirim pesan"
                >
                  <Icon icon="lucide:send-horizontal" width={20} height={20} aria-hidden="true" />
                </button>
              </div>
            </footer>
          </div>
        </section>
      )}
    </div>
  );
}
