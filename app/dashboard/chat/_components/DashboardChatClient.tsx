"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

type ConversationRow = {
  id: string;
  listingTitle: string | null;
  listingSlug: string | null;
  buyerName: string | null;
  lastMessageAt: Date;
  lastMessageContent: string | null;
  unreadCount: number;
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function DashboardChatClient({
  conversations,
  currentUserId,
}: {
  conversations: ConversationRow[];
  currentUserId: string;
}) {
  function openChat(conversationId: string) {
    window.dispatchEvent(
      new CustomEvent("rotaryOpenChat", {
        detail: { conversationId },
      }),
    );
  }

  return (
    <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)] overflow-hidden">
      <div className="divide-y divide-[var(--seller-rule)]">
        {conversations.map((conv) => {
          const hasUnread = conv.unreadCount > 0;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => openChat(conv.id)}
              className="group flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--seller-brand-soft)] focus-visible:bg-[var(--seller-brand-soft)] focus-visible:outline-none"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
                <Icon icon="lucide:user-round" width={18} height={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`truncate text-[13px] font-semibold ${hasUnread ? "text-[var(--seller-ink)]" : "text-[var(--seller-muted)]"}`}>
                    {conv.buyerName ?? "Pengguna Rotary"}
                  </p>
                  {hasUnread && (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#ef476f] px-1 text-[9px] font-bold text-white">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-[var(--seller-muted)]">
                  {conv.listingTitle && (
                    <span className="mr-1.5 inline-flex items-center gap-0.5 rounded bg-[var(--seller-brand-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--seller-brand)]">
                      <Icon icon="lucide:package" width={10} height={10} aria-hidden="true" />
                      {conv.listingTitle}
                    </span>
                  )}
                  {conv.lastMessageContent ?? "Percakapan baru"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[11px] text-[var(--seller-muted)]">
                  {formatRelativeTime(conv.lastMessageAt)}
                </span>
                <span className="flex h-7 items-center gap-1.5 rounded-[6px] border border-[var(--seller-rule-strong)] px-2 text-[10px] font-semibold text-[var(--seller-brand)] transition-colors group-hover:border-[var(--seller-brand)] group-hover:bg-white">
                  <Icon icon="lucide:messages-square" width={12} height={12} aria-hidden="true" />
                  Buka
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
