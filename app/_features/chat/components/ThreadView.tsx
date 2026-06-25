import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { useConversation } from "../hooks/useConversation";
import { OnlineDot } from "./OnlineDot";
import { onlineLabel } from "../utils";
import { MessageBubble } from "./MessageBubble";

const quickReplies = [
  "Barang ini masih ada?",
  "Bisa atur temu hari ini?",
  "Bisa nego sedikit?",
];

export function ThreadView({
  conversationId,
  currentUserId,
  onBack,
  onClose,
}: {
  conversationId: string;
  currentUserId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const { messages, otherUser, loading, error, sending, sendMessage } = useConversation(conversationId);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || sending) return;
    setInputValue("");
    await sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleQuickReply(reply: string) {
    setInputValue(reply);
    inputRef.current?.focus();
  }

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-[#edf0f5] px-3.5 md:px-5 shrink-0" style={{ height: 64 }}>
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#17458f] transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] md:hidden"
            aria-label="Kembali ke daftar chat"
          >
            <Icon icon="lucide:chevron-left" width={22} height={22} aria-hidden="true" />
          </button>
          <span className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[#17458f] sm:flex">
            {otherUser?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={otherUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <Icon icon="lucide:user-round" width={18} height={18} aria-hidden="true" />
            )}
            <OnlineDot lastSeenAt={otherUser?.lastSeenAt ?? null} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[16px] font-semibold text-black">
                {otherUser?.name ?? "Memuat..."}
              </h2>
            </div>
            <p className="truncate text-[11px] text-[#6b7280]">
              {otherUser ? onlineLabel(otherUser.lastSeenAt) : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#fff7e8] hover:text-[#17458f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
            aria-label="Tutup chat"
          >
            <Icon icon="lucide:chevron-down" width={21} height={21} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfcfe] px-4 py-3.5 md:px-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-10 w-48 animate-pulse rounded-[18px] bg-[#e5e7eb] ${i % 2 === 0 ? "" : "ml-auto"}`} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Icon icon="lucide:circle-alert" width={32} height={32} className="text-[#ef476f]" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-black">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7e8] text-[#f7a81b]">
              <Icon icon="lucide:messages-square" width={26} height={26} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-black">Belum ada pesan</p>
              <p className="mt-1 text-[11px] text-[#6b7280]">Kirim pesan pertama untuk memulai percakapan</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[420px] space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.senderId === currentUserId} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-[#edf0f5] bg-white px-4 py-3 md:px-5">
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="shrink-0 rounded-full border border-[#f7a81b] px-3.5 py-1.5 text-[12px] font-semibold text-[#17458f] transition-colors hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_44px] gap-2.5">
          <div className="flex h-[42px] items-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-3 transition-colors focus-within:border-[#f7a81b]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-[#b2b8c3]"
              placeholder="Tulis pesan..."
              maxLength={2000}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f7a81b] text-white shadow-[0_8px_18px_rgba(247,168,27,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#e89a14] hover:shadow-[0_12px_24px_rgba(247,168,27,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a81b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Kirim pesan"
          >
            {sending ? (
              <Icon icon="lucide:loader-circle" width={18} height={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Icon icon="lucide:send-horizontal" width={20} height={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </footer>
    </>
  );
}
