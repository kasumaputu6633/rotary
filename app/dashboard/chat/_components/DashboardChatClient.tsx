"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useCallback } from "react";
import type { ConversationSummary } from "@/app/_features/chat/types";
import { ConversationList } from "@/app/_features/chat/_components/ConversationList";
import { ThreadView } from "@/app/_features/chat/_components/ThreadView";

export default function DashboardChatClient({
  conversations: initialConversations,
  currentUserId,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        // Since this is the seller dashboard, filter only those where current user is seller
        const sellerConversations = data.filter((c: ConversationSummary) => c.sellerId === currentUserId);
        setConversations(sellerConversations);
      }
    } catch {
      // Ignore
    }
  }, [currentUserId]);

  useEffect(() => {
    const interval = setInterval(fetchConversations, 30_000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  return (
    <section className="grid h-[calc(100vh-210px)] min-h-[600px] w-full overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)] md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Sidebar List */}
      <div className={`${activeConversationId ? "hidden md:flex" : "flex"} flex-col min-h-0 min-w-0 border-r border-[#edf0f5]`}>
        <ConversationList
          conversations={conversations}
          loading={false}
          currentUserId={currentUserId}
          onSelect={setActiveConversationId}
          onClose={() => {}} // Disabled in dashboard view
        />
      </div>

      {/* Main Thread Area */}
      {activeConversationId ? (
        <div className={`${!activeConversationId ? "hidden md:grid" : "grid"} min-h-0 min-w-0 grid-rows-[64px_minmax(0,1fr)_auto]`}>
          <ThreadView
            conversationId={activeConversationId}
            currentUserId={currentUserId}
            onBack={() => setActiveConversationId(null)}
            onClose={() => setActiveConversationId(null)} // Hidden via css on desktop, serves as back on mobile
          />
        </div>
      ) : (
        <div className="hidden min-w-0 flex-col items-center justify-center gap-3 text-center md:flex bg-[#f8fafc]">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6ff] text-[#17458f]">
            <Icon icon="lucide:message-circle" width={32} height={32} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-black">Pilih percakapan</p>
            <p className="mt-1 text-[12px] text-[#6b7280]">Klik salah satu chat di kiri untuk membuka</p>
          </div>
        </div>
      )}
    </section>
  );
}
