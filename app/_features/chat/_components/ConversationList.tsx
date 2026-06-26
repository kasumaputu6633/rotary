import { Icon } from "@iconify/react";
import type { ConversationSummary } from "../types";
import { OnlineDot } from "./OnlineDot";

export function ConversationList({
  conversations,
  loading,
  currentUserId,
  onSelect,
  onClose,
}: {
  conversations: ConversationSummary[];
  loading: boolean;
  currentUserId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <aside className="flex flex-col border-r border-[#edf0f5] bg-white h-full min-h-0">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#edf0f5] px-3.5">
        <h2 className="text-[18px] font-semibold text-black">Chat</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#fff7e8] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] md:hidden"
          aria-label="Tutup chat"
        >
          <Icon icon="lucide:chevron-down" width={21} height={21} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 rounded-xl p-2">
                <div className="h-[38px] w-[38px] animate-pulse rounded-full bg-[#e5e7eb]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#e5e7eb]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#e5e7eb]" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7e8] text-[#f7a81b]">
              <Icon icon="lucide:inbox" width={22} height={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-black">Belum ada percakapan</p>
              <p className="mt-1 text-[11px] text-[#6b7280]">Buka halaman produk dan klik &quot;Chat Penjual&quot; untuk memulai</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conv) => {
              const otherName = currentUserId === conv.buyerId ? conv.sellerName : conv.buyerName;
              const otherAvatarUrl = currentUserId === conv.buyerId ? conv.sellerAvatarUrl : conv.buyerAvatarUrl;
              const badge = currentUserId === conv.buyerId ? "Penjual" : "Pembeli";
              const hasUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className="grid w-full grid-cols-[38px_minmax(0,1fr)] items-center gap-2 rounded-xl p-2 text-left transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                >
                  <span className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[#17458f]">
                    {otherAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={otherAvatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <Icon icon="lucide:user-round" width={18} height={18} aria-hidden="true" />
                    )}
                    <OnlineDot lastSeenAt={conv.otherUserLastSeenAt} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className={`truncate text-[14px] font-semibold ${hasUnread ? "text-black" : "text-[#374151]"}`}>
                        {otherName ?? "Pengguna Rotary"}
                      </span>
                      <span className="rounded-md bg-[#fff1d6] px-1.5 py-0.5 text-[10px] font-semibold text-[#17458f]">
                        {badge}
                      </span>
                      {hasUnread && (
                        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef476f] px-1 text-[9px] font-bold text-white">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </span>
                    <span className={`mt-0.5 block truncate text-[11px] ${hasUnread ? "font-semibold text-[#374151]" : "text-[#6b7280]"}`}>
                      {(conv.lastMessageContent?.trim() || conv.listingTitle) ?? "Percakapan baru"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
