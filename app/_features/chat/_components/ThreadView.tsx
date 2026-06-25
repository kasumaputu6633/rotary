import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useConversation } from "../_hooks/useConversation";
import type { MessageAttachment } from "../_hooks/useConversation";
import { OnlineDot } from "./OnlineDot";
import { onlineLabel } from "../utils";
import { MessageBubble } from "./MessageBubble";

const quickReplies = [
  "Barang ini masih ada?",
  "Bisa atur temu hari ini?",
  "Bisa nego sedikit?",
];

import type { ChatMessage } from "../_hooks/useConversation";

export function ThreadView({
  conversationId,
  currentUserId,
  pendingAttachment,
  onAttachmentSent,
  onBack,
  onClose,
}: {
  conversationId: string;
  currentUserId: string;
  pendingAttachment?: MessageAttachment | null;
  onAttachmentSent?: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const { messages, otherUser, loading, error, sending, sendMessage } = useConversation(conversationId, currentUserId);
  const [inputValue, setInputValue] = useState("");
  const [dismissedAttachment, setDismissedAttachment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track last attachment id to detect when user picks a new product
  const lastAttachmentIdRef = useRef<string | undefined>(pendingAttachment?.id);
  if (pendingAttachment?.id !== lastAttachmentIdRef.current) {
    lastAttachmentIdRef.current = pendingAttachment?.id;
    // Reset dismissed state synchronously before render when attachment changes
    // This is safe because it's in the render path, not inside a useEffect
    if (dismissedAttachment) setDismissedAttachment(false);
  }

  const showAttachmentPreview = !dismissedAttachment && Boolean(pendingAttachment);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const text = inputValue.trim();
    if (!text && !showAttachmentPreview) return;
    if (sending) return;

    setInputValue("");
    const currentReplyingTo = replyingTo;
    setReplyingTo(null);

    if (showAttachmentPreview) {
      await sendMessage("", pendingAttachment!.id, text ? undefined : currentReplyingTo ?? undefined);
    }
    if (text) {
      await sendMessage(text, undefined, currentReplyingTo ?? undefined);
    }

    if (showAttachmentPreview) {
      setDismissedAttachment(true);
      onAttachmentSent?.();
    }
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
          <div className="mx-auto w-full max-w-4xl space-y-3">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                msg={msg} 
                isOwn={msg.senderId === currentUserId} 
                onReply={(msgToReply) => {
                  setReplyingTo(msgToReply);
                  inputRef.current?.focus();
                }}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer / Input Area */}
      <footer className="relative shrink-0 border-t border-[#edf0f5] bg-white px-4 py-3 md:px-5">
        {/* Reply Preview Box */}
        {replyingTo && (
          <div className="absolute bottom-full left-0 right-0 border-t border-[#edf0f5] bg-white px-4 py-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.04)] md:px-5">
            <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2 border-l-4 border-l-[#f7a81b]">
              {replyingTo.attachment && (
                replyingTo.attachment.imageUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[4px] bg-white">
                    <Image src={replyingTo.attachment.imageUrl} alt={replyingTo.attachment.title} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-white text-[#94a3b8]">
                    <Icon icon="lucide:image" width={16} height={16} />
                  </div>
                )
              )}
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className="text-[12px] font-bold text-[#f7a81b] mb-0.5">Membalas {replyingTo.senderId === currentUserId ? "pesan Anda" : (otherUser?.name || "pesan")}</p>
                <p className="truncate text-[12px] text-black">
                  {replyingTo.content?.trim() ? replyingTo.content : replyingTo.attachment?.title || "Lampiran Produk"}
                </p>
                {!(replyingTo.content?.trim()) && replyingTo.attachment?.price != null && (
                  <p className="truncate text-[11px] text-[#64748b]">
                    {!replyingTo.attachment.price ? "Gratis" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(replyingTo.attachment.price)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] self-start"
                aria-label="Batal balas"
              >
                <Icon icon="lucide:x" width={16} height={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Attachment Preview Box */}
        {showAttachmentPreview && pendingAttachment && !replyingTo && (
          <div className="absolute bottom-full left-0 right-0 border-t border-[#edf0f5] bg-white px-4 py-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.04)] md:px-5">
            <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2">
              {pendingAttachment.imageUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                  <Image src={pendingAttachment.imageUrl} alt={pendingAttachment.title} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white text-[#b2b8c3]">
                  <Icon icon="lucide:image" width={16} height={16} aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-black">{pendingAttachment.title}</p>
                <p className="text-[11px] font-bold text-[#f7a81b]">
                  {!pendingAttachment.price ? "Gratis" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pendingAttachment.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDismissedAttachment(true)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f]"
                aria-label="Hapus attachment"
              >
                <Icon icon="lucide:x" width={16} height={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

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
              placeholder={showAttachmentPreview ? "Tambahkan pesan (opsional)..." : "Tulis pesan..."}
              maxLength={2000}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !showAttachmentPreview) || sending}
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
