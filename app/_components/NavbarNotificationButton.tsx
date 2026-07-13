"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { playSfx } from "@/lib/sfx";
import { CHAT_UNREAD_CHANGED_EVENT } from "@/app/_features/chat/events";

type NotificationType =
  | "listing_deactivated"
  | "listing_blocked"
  | "favorite_reserved"
  | "favorite_sold"
  | "favorite_price_drop"
  | "security_new_device"
  | "security_password_changed";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

const typeIcon: Record<NotificationType, { icon: string; accent: string }> = {
  listing_deactivated: { icon: "lucide:circle-pause", accent: "text-[#f7a81b]" },
  listing_blocked: { icon: "lucide:shield-alert", accent: "text-[#ef476f]" },
  favorite_reserved: { icon: "lucide:bookmark-check", accent: "text-[#17458f]" },
  favorite_sold: { icon: "lucide:package-check", accent: "text-[#17458f]" },
  favorite_price_drop: { icon: "lucide:trending-down", accent: "text-emerald-600" },
  security_new_device: { icon: "lucide:monitor-smartphone", accent: "text-[#ef476f]" },
  security_password_changed: { icon: "lucide:key-round", accent: "text-[#ef476f]" },
};

const POLL_INTERVAL = 30000;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NavbarNotificationButton({ isLoggedIn, isAdmin }: { isLoggedIn?: boolean; isAdmin?: boolean }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnread, setChatUnread] = useState({ messageCount: 0, conversationCount: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevUnreadRef = useRef<number | null>(null);         // null = initial load belum selesai
  const prevChatUnreadRef = useRef<number | null>(null);     // untuk mendeteksi pesan chat baru

  const fetchNotifications = useCallback(async () => {
    if (isLoggedIn === false) return;
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const newUnread = typeof data.unreadCount === "number" ? data.unreadCount : 0;
      const newChatUnread = data.chatUnread && typeof data.chatUnread.messageCount === "number"
        ? data.chatUnread
        : { messageCount: 0, conversationCount: 0 };

      // Bunyikan SFX jika notif listing bertambah (skip initial load)
      // Note: Pesan chat baru sekarang ditangani SFX-nya oleh useUnreadCount agar sinkron dengan badge chat
      const listingIncreased = prevUnreadRef.current !== null && newUnread > prevUnreadRef.current;
      if (listingIncreased) {
        playSfx("notification");
      }

      prevUnreadRef.current = newUnread;
      prevChatUnreadRef.current = newChatUnread.messageCount;

      setItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(newUnread);
      setChatUnread(newChatUnread);
    } catch {
      // Diam saja — badge notifikasi tidak boleh mengganggu navbar.
    }
  }, [isLoggedIn]);

  // Poll berkala untuk badge (pola sama seperti unread chat).
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listener untuk event chat dibaca atau diubah dari useConversation
  useEffect(() => {
    const handleUnreadChanged = () => {
      fetchNotifications();
    };

    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, handleUnreadChanged);
    return () => window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, handleUnreadChanged);
  }, [fetchNotifications]);

  // Refresh saat dropdown dibuka agar isinya paling baru.
  useEffect(() => {
    if (showDropdown) fetchNotifications();
  }, [showDropdown, fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Optimistic — abaikan kegagalan jaringan.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // Optimistic — abaikan kegagalan jaringan.
    }
  }, []);

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      setDropdownPosition({
        top: rect.bottom + 8,
        right: isMobile ? 16 : Math.max(16, window.innerWidth - rect.right),
      });
      setIsPositioned(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsPositioned(false);
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  useEffect(() => {
    function handleClose() {
      setShowDropdown(false);
    }

    window.addEventListener("navbarDropdownClose", handleClose);
    return () => window.removeEventListener("navbarDropdownClose", handleClose);
  }, []);

  useEffect(() => {
    const event = new CustomEvent("profileDropdownToggle", { detail: { isOpen: showDropdown } });
    window.dispatchEvent(event);
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowDropdown((open) => !open)}
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#fff7e8] ${showDropdown ? "bg-[#fff7e8]" : ""
          }`}
        aria-label="Notifikasi"
        aria-expanded={showDropdown}
      >
        <Icon icon="lucide:bell" width={21} height={21} className="text-[#555]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef476f] px-1 font-open-sauce text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && isPositioned && (
        <div
          className="fixed z-9999 w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-gray-200/80 bg-white animate-[dropdownSlideIn_180ms_cubic-bezier(0.2,0.8,0.2,1)_both] md:w-[min(400px,calc(100vw-32px))]"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            boxShadow: "0 18px 44px rgba(23, 69, 143, 0.18), 0 8px 22px rgba(0, 0, 0, 0.16)",
          }}
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-open-sauce text-[17px] font-semibold text-black">Notifikasi</h2>
                {unreadCount > 0 && (
                  <span className="flex items-center gap-1 font-open-sauce text-[10px] font-semibold text-[#ef476f]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ef476f]" />
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-open-sauce text-[11px] text-[#6b7280]">Kabar listing dan barang favoritmu.</p>
            </div>
            {isLoggedIn !== false && (
              <Link
                href="/account/notifications"
                onClick={() => setShowDropdown(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f4f6f8] hover:text-[#17458f]"
                aria-label="Pengaturan notifikasi"
              >
                <Icon icon="lucide:settings" width={17} height={17} aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="max-h-90 overflow-y-auto">
            {chatUnread.messageCount > 0 && !isAdmin && (
              <Link
                href="/dashboard/chat"
                onClick={() => setShowDropdown(false)}
                className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 bg-[#fff9f0] p-3 text-left transition-colors hover:bg-[#fff4e0]"
              >
                <Icon icon="lucide:messages-square" width={18} height={18} className="text-[#f7a81b]" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate font-open-sauce text-[12px] font-semibold text-black">
                    {chatUnread.messageCount} pesan belum dibaca
                  </span>
                  <span className="block truncate font-open-sauce text-[11px] text-[#6b7280]">
                    {chatUnread.conversationCount > 1
                      ? `Dari ${chatUnread.conversationCount} percakapan — buka chat untuk membalas.`
                      : "Buka chat untuk membalas."}
                  </span>
                </span>
                <Icon icon="lucide:chevron-right" width={15} height={15} className="text-[#9aa3af]" aria-hidden="true" />
              </Link>
            )}
            {items.length === 0 && chatUnread.messageCount === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f6f8]">
                  <Icon icon={isLoggedIn === false ? "lucide:log-in" : "lucide:bell-off"} width={22} height={22} className="text-[#9aa3af]" aria-hidden="true" />
                </span>
                <p className="font-open-sauce text-[13px] font-semibold text-black">
                  {isLoggedIn === false ? "Masuk untuk melihat notifikasi" : "Belum ada notifikasi"}
                </p>
                <p className="font-open-sauce text-[11px] leading-relaxed text-[#6b7280]">
                  {isLoggedIn === false
                    ? "Silakan masuk atau daftar untuk menerima pembaruan aktivitasmu."
                    : "Kabar tentang listing dan barang favoritmu akan muncul di sini."}
                </p>
                {isLoggedIn === false && (
                  <Link
                    href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                    onClick={() => setShowDropdown(false)}
                    className="mt-3 rounded-lg bg-[#17458f] px-4 py-2 font-open-sauce text-[12px] font-semibold text-white transition-colors hover:bg-[#113268]"
                  >
                    Masuk Sekarang
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid">
                {items.map((n) => {
                  const meta = typeIcon[n.type] ?? { icon: "lucide:bell", accent: "text-[#17458f]" };
                  const content = (
                    <>
                      <span className="relative mt-0.5">
                        <Icon icon={meta.icon} width={18} height={18} className={meta.accent} aria-hidden="true" />
                        {!n.isRead && (
                          <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[#ef476f]" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-open-sauce text-[12px] font-semibold text-black">
                          {n.title}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block font-open-sauce text-[11px] leading-snug text-[#6b7280]">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-1 block font-open-sauce text-[10px] text-[#9aa3af]">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                    </>
                  );
                  const rowClass = `grid grid-cols-[20px_minmax(0,1fr)] gap-3 border-l-2 p-3 text-left transition-colors ${n.isRead
                    ? "border-transparent hover:bg-[#f9fafb]"
                    : "border-[#f7a81b] bg-[#fffdf8] hover:bg-[#fffaf0]"
                    }`;

                  return n.href ? (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        if (!n.isRead) markRead(n.id);
                        setShowDropdown(false);
                      }}
                      className={rowClass}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        if (!n.isRead) markRead(n.id);
                      }}
                      className={rowClass}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isLoggedIn !== false && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="font-open-sauce text-[12px] font-semibold text-[#17458f] transition-colors hover:text-[#f7a81b] disabled:cursor-not-allowed disabled:text-[#c5cbd6]"
              >
                Tandai semua dibaca
              </button>
              <Link
                href="/account/notifications"
                onClick={() => setShowDropdown(false)}
                className="font-open-sauce text-[12px] font-semibold text-[#17458f] hover:text-[#f7a81b]"
              >
                Pengaturan
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
