"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ConversationSummary } from "../types";
import type { MessageAttachment } from "../_hooks/useConversation";
import { ConversationList } from "./ConversationList";
import { ThreadView } from "./ThreadView";

const hiddenPathPrefixes = ["/login", "/register", "/forgot-password", "/unauthorized", "/account", "/admin", "/dashboard", "/waste"];

export default function FloatingChat({ currentUserId, isAdmin }: { currentUserId: string | null; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLauncherLeaving, setIsLauncherLeaving] = useState(false);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const launcherTimerRef = useRef<number | null>(null);
  const panelTimerRef = useRef<number | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);

  const shouldHide = hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Hitung total unread dari daftar conversations (lebih akurat dari polling terpisah)
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const clearTimers = useCallback(() => {
    if (launcherTimerRef.current) window.clearTimeout(launcherTimerRef.current);
    if (panelTimerRef.current) window.clearTimeout(panelTimerRef.current);
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/chat/conversations", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as ConversationSummary[];
        const activeId = activeConversationIdRef.current;
        setConversations(
          activeId
            ? data.map((conv) => conv.id === activeId ? { ...conv, unreadCount: 0 } : conv)
            : data,
        );
      }
    } catch {
      // Ignore
    }
  }, [currentUserId]);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) => conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv),
    );
  }, []);

  const openChat = useCallback(
    (conversationId?: string) => {
      clearTimers();
      setIsPanelClosing(false);
      setIsLauncherLeaving(true);

      if (conversationId) {
        setActiveConversationId(conversationId);
        setMobileView("thread");
      } else {
        setMobileView("list");
      }

      launcherTimerRef.current = window.setTimeout(async () => {
        setConvLoading(true);
        setIsOpen(true);
        setIsLauncherLeaving(false);
        await fetchConversations();
        setConvLoading(false);
      }, 170);
    },
    [clearTimers, fetchConversations],
  );

  const closeChat = useCallback(() => {
    clearTimers();
    setIsPanelClosing(true);
    panelTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsPanelClosing(false);
    }, 180);
  }, [clearTimers]);

  // Listen to rotaryOpenChat event
  useEffect(() => {
    function handleOpenChat(e: Event) {
      const detail = (e as CustomEvent).detail as { conversationId?: string; listing?: MessageAttachment | null } | undefined;
      // Simpan attachment produk yang dipilih
      if (detail?.listing) setPendingAttachment(detail.listing);
      openChat(detail?.conversationId);
    }

    window.addEventListener("rotaryOpenChat", handleOpenChat);
    return () => {
      window.removeEventListener("rotaryOpenChat", handleOpenChat);
      clearTimers();
    };
  }, [clearTimers, openChat]);

  // Refresh daftar: lebih sering saat panel terbuka, ringan saat launcher tertutup.
  useEffect(() => {
    if (!currentUserId || shouldHide) return;
    void fetchConversations();
    const interval = setInterval(fetchConversations, isOpen ? 5_000 : 30_000);
    return () => clearInterval(interval);
  }, [isOpen, currentUserId, fetchConversations, shouldHide]);

  // Tidak tampilkan untuk user yang tidak login di page yang bukan hidden
  if (shouldHide) return null;
  if (!currentUserId) return null;
  if (isAdmin) return null;

  function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    setMobileView("thread");
    markConversationRead(id);
  }

  return (
    <>
      {/* Overlay: klik di luar panel → tutup chat. Harus SIBLING dari container,
          bukan di dalamnya, agar z-index bekerja benar. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9799]"
          aria-hidden="true"
          onClick={closeChat}
        />
      )}

      {/* Container panel + launcher — z-9800 di atas overlay z-9799 */}
      <div data-floating-chat className="fixed bottom-6 right-5 z-[9800] font-open-sauce md:bottom-16 md:right-24">
        {!isOpen && (
          <button
            type="button"
            onClick={() => openChat()}
            className={`floating-chat-launcher group relative inline-flex h-12 items-center gap-2.5 rounded-full border border-[#d9e0ea] bg-white pl-3.5 pr-4 text-[#17458f] shadow-[0_10px_26px_rgba(15,23,42,0.18),0_4px_12px_rgba(23,69,143,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#f7a81b] hover:shadow-[0_14px_32px_rgba(15,23,42,0.22),0_6px_14px_rgba(247,168,27,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4 ${isLauncherLeaving ? "floating-chat-launcher-out" : ""
              }`}
            aria-label="Buka chat"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#f7a81b] text-white shadow-[0_5px_12px_rgba(247,168,27,0.28)] transition-all group-hover:scale-105 group-hover:bg-[#e89a14] group-hover:shadow-[0_7px_16px_rgba(247,168,27,0.34)]">
              <Icon icon="lucide:messages-square" width={19} height={19} aria-hidden="true" />
              {totalUnread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef476f] px-0.5 text-[9px] font-bold text-white">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </span>
            <span className="text-[14px] font-semibold">Chat</span>
          </button>
        )}

        {isOpen && (
          <section
            className={`floating-chat-panel fixed inset-x-4 bottom-4 grid h-[min(560px,calc(100dvh-32px))] w-auto overflow-hidden rounded-2xl border border-[#d9e0ea] bg-white shadow-[0_20px_52px_rgba(15,23,42,0.22),0_10px_22px_rgba(23,69,143,0.16)] md:static md:h-[min(540px,calc(100vh-90px))] md:w-[min(650px,calc(100vw-32px))] ${isPanelClosing ? "floating-chat-panel-out" : ""
              } md:grid-cols-[230px_minmax(0,1fr)]`}
            aria-label="Panel chat"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            <div className={`${mobileView === "list" ? "flex flex-col" : "hidden"} md:flex md:flex-col min-h-0 border-r border-[#edf0f5]`}>
              <ConversationList
                conversations={conversations}
                loading={convLoading}
                currentUserId={currentUserId}
                onSelect={handleSelectConversation}
                onClose={closeChat}
              />
            </div>

            {/* Thread: pakai grid saat ada conversation aktif, flex-center saat placeholder */}
            {activeConversationId ? (
              <div className={`${mobileView === "thread" ? "grid" : "hidden"} min-w-0 min-h-0 grid-rows-[64px_minmax(0,1fr)_auto] md:grid`}>
                <ThreadView
                  conversationId={activeConversationId}
                  currentUserId={currentUserId}
                  pendingAttachment={pendingAttachment}
                  onAttachmentSent={() => setPendingAttachment(null)}
                  onConversationRead={markConversationRead}
                  onConversationChanged={fetchConversations}
                  onBack={() => setMobileView("list")}
                  onClose={closeChat}
                />
              </div>
            ) : (
              /* Placeholder saat belum ada / belum pilih conversation — rata tengah */
              <div className="hidden min-w-0 flex-col items-center justify-center gap-3 text-center md:flex">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7e8] text-[#f7a81b]">
                  <Icon icon="lucide:message-circle" width={26} height={26} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-black">Pilih percakapan</p>
                  <p className="mt-1 text-[11px] text-[#6b7280]">Klik salah satu chat di kiri untuk membuka</p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
