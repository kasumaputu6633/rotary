import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../_hooks/useConversation";
import { formatTime } from "../utils";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export function MessageBubble({ msg, isOwn, onReply }: { msg: ChatMessage; isOwn: boolean; onReply?: (msgToReply: ChatMessage) => void }) {
  const { attachment, replyToMessage } = msg;
  // Trim whitespace-only content (used for attachment-only messages)
  const content = msg.content.trim();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const renderActionMenu = (replyMsg: ChatMessage, isAttachment: boolean) => {
    if (isAttachment) {
      return (
        <button
          onClick={() => onReply?.(replyMsg)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-200 text-gray-500 self-center shrink-0 ${isOwn ? "mr-1" : "ml-1"}`}
          aria-label="Balas pesan"
          title="Balas pesan"
        >
          <Icon icon="lucide:reply" width={16} height={16} />
        </button>
      );
    }

    return (
      <div className={`relative opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0 ${isOwn ? "mr-1" : "ml-1"} ${menuOpen ? "opacity-100" : ""}`}>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none ${menuOpen ? "bg-gray-200" : ""}`}
            aria-label="Opsi lainnya"
            title="Opsi lainnya"
          >
            <Icon icon="lucide:more-horizontal" width={16} height={16} />
          </button>
          {/* Dropdown Menu */}
          {menuOpen && (
            <div className={`absolute z-10 min-w-[140px] rounded-lg border border-[#edf0f5] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${isOwn ? "right-[110%] top-0" : "left-[110%] top-0"}`}>
              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onReply?.(replyMsg);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  <Icon icon="lucide:reply" width={15} height={15} className="text-gray-400" />
                  Balas
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Fitur laporan sedang dalam pengembangan oleh admin");
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  <Icon icon="lucide:circle-alert" width={15} height={15} className="text-gray-400" />
                  Laporkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ticks = isOwn ? (
    <Icon 
      icon="lucide:check-check" 
      width={14} 
      height={14} 
      className={`ml-1 inline-block ${msg.isRead ? "text-blue-500" : "text-slate-400"}`} 
    />
  ) : null;

  const quotedMessageUI = replyToMessage ? (
    <div className={`mb-1.5 flex flex-col overflow-hidden rounded-[8px] text-[12px] border-l-4 ${isOwn ? "bg-[#e2e8f0]/80 border-[#f7a81b]" : "bg-[#f1f5f9] border-[#f7a81b]"}`}>
      <div className="px-2 pt-1.5 pb-0.5">
        <span className="font-semibold text-[#17458f]">
          {replyToMessage.senderId === msg.senderId ? "Anda" : "Pesan Dibalas"}
        </span>
      </div>
      
      {replyToMessage.attachment ? (
        <div className="flex px-2 pb-2 gap-2 mt-0.5 items-center">
           {replyToMessage.attachment.imageUrl ? (
             <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[4px] bg-[#cbd5e1]">
               <Image src={replyToMessage.attachment.imageUrl} alt="attachment" fill className="object-cover" sizes="40px" />
             </div>
           ) : (
             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#cbd5e1] text-[#94a3b8]">
               <Icon icon="lucide:image" width={16} height={16} />
             </div>
           )}
           <div className="min-w-0 flex flex-col justify-center">
             <span className="truncate text-[#1e293b]">{replyToMessage.content?.trim() ? replyToMessage.content : replyToMessage.attachment.title}</span>
             {!(replyToMessage.content?.trim()) && replyToMessage.attachment.price != null && (
               <span className="truncate text-[11px] text-[#64748b]">
                 {!replyToMessage.attachment.price ? "Gratis" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(replyToMessage.attachment.price)}
               </span>
             )}
           </div>
        </div>
      ) : (
        <div className="px-2 pb-2 truncate text-[#475569]">
          {replyToMessage.content}
        </div>
      )}
    </div>
  ) : null;

  const timeAndStatus = (
    <div className="mt-1 flex items-center justify-end text-[11px] text-[#8a95a6]">
      {formatTime(msg.createdAt)}
      {ticks}
    </div>
  );

  const attachmentCard = attachment ? (
    <div className="flex w-full max-w-[280px]">
      <Link
        href={`/products/${attachment.slug}`}
        className="block w-full max-w-[280px] rounded-[16px] bg-white border border-[#e2e8f0] p-3 shadow-sm hover:shadow transition-all"
      >
        <div className="flex gap-3 items-center">
          {attachment.imageUrl && (
            <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md bg-[#f1f5f9]">
              <Image src={attachment.imageUrl} alt={attachment.title} fill className="object-cover" sizes="60px" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-black">{attachment.title}</p>
            <p className="mt-0.5 text-[13px] font-bold text-[#f7a81b]">
              {!attachment.price ? "Gratis" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(attachment.price)}
            </p>
          </div>
        </div>
        {!content && timeAndStatus}
      </Link>
    </div>
  ) : null;

  const textBubble = content || replyToMessage ? (
    <div className={`w-fit max-w-[85%] md:max-w-[75%] lg:max-w-[600px] rounded-[18px] px-4 py-2.5 text-[13.5px] leading-relaxed text-black ${
      isOwn ? "rounded-tr-[6px] bg-[#eef1f6]" : "rounded-tl-[6px] border border-[#d9e0ea] bg-white shadow-sm"
    }`}>
      {quotedMessageUI}
      {content}
      {timeAndStatus}
    </div>
  ) : null;

  const renderRow = (node: React.ReactNode, isAttachment: boolean, replyMsg: ChatMessage) => (
    <div className={`group flex items-end ${isOwn ? "justify-end" : "justify-start"} ${isAttachment && textBubble ? "mb-2" : ""}`}>
      {isOwn && renderActionMenu(replyMsg, isAttachment)}
      {node}
      {!isOwn && renderActionMenu(replyMsg, isAttachment)}
    </div>
  );

  return (
    <div className="flex flex-col">
      {attachmentCard && renderRow(attachmentCard, true, { ...msg, content: " " })}
      {textBubble && renderRow(textBubble, false, { ...msg, attachment: null })}
    </div>
  );
}
