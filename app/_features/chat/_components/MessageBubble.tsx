import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ChatMessage } from "../_hooks/useConversation";
import { formatTime } from "../utils";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export function MessageBubble({ msg, isOwn, onReply, onDelete }: { msg: ChatMessage; isOwn: boolean; onReply?: (msgToReply: ChatMessage) => void; onDelete?: (msgToDelete: ChatMessage) => void }) {
  const { attachment, replyToMessage } = msg;
  // Trim whitespace-only content (used for attachment-only messages)
  const content = msg.content.trim();

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuPos) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuPos]);

  const isDeletable = isOwn && (Date.now() - new Date(msg.createdAt).getTime() < 3 * 60 * 1000);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const renderContextMenu = () => {
    if (!menuPos || typeof document === "undefined") return null;
    return createPortal(
      <div
        ref={menuRef}
        className="fixed z-[9999] min-w-[140px] rounded-lg border border-[#edf0f5] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden"
        style={{ top: menuPos.y, left: menuPos.x }}
      >
        <div className="py-1">
          <button
            onClick={() => {
              setMenuPos(null);
              onReply?.(msg);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
          >
            <Icon icon="lucide:reply" width={15} height={15} className="text-gray-400" />
            Balas
          </button>
          {isDeletable && (
            <button
              onClick={() => {
                setMenuPos(null);
                onDelete?.(msg);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-red-600 hover:bg-red-50"
            >
              <Icon icon="lucide:trash-2" width={15} height={15} className="text-red-500" />
              Hapus
            </button>
          )}
          {!isOwn && (
            <button
              onClick={() => {
                setMenuPos(null);
                alert("Fitur laporan sedang dalam pengembangan oleh admin");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
            >
              <Icon icon="lucide:circle-alert" width={15} height={15} className="text-gray-400" />
              Laporkan
            </button>
          )}
        </div>
      </div>,
      document.body
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

  const renderMenuTrigger = (isAttachmentCard: boolean) => {
    let bgClass = "";
    if (isAttachmentCard) {
      bgClass = "bg-gradient-to-l from-white from-60% to-transparent rounded-tr-[16px]";
    } else {
      bgClass = isOwn 
        ? "bg-gradient-to-l from-[#eef1f6] from-60% to-transparent rounded-tr-[6px]" 
        : "bg-gradient-to-l from-white from-60% to-transparent rounded-tr-[18px]";
    }

    return (
      <button
        onClick={handleContextMenu}
        className={`absolute top-0 right-0 z-10 flex h-10 w-12 items-start justify-end pt-2 pr-2 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover/bubble:opacity-100 focus:opacity-100 ${bgClass}`}
        aria-label="Opsi pesan"
      >
        <Icon icon="lucide:chevron-down" width={18} height={18} />
      </button>
    );
  };

  const attachmentCard = attachment ? (
    <div className="flex w-full max-w-[280px] relative group/bubble" onContextMenu={handleContextMenu}>
      {renderMenuTrigger(true)}
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
    <div onContextMenu={handleContextMenu} className={`relative group/bubble w-fit max-w-[calc(100%-3rem)] md:max-w-[75%] rounded-[18px] px-4 py-2.5 text-[13.5px] leading-relaxed text-black ${
      isOwn ? "rounded-tr-[6px] bg-[#eef1f6]" : "rounded-tl-[6px] border border-[#d9e0ea] bg-white shadow-sm"
    }`}>
      {renderMenuTrigger(false)}
      {quotedMessageUI}
      {content}
      {timeAndStatus}
    </div>
  ) : null;

  const renderRow = (node: React.ReactNode, isAttachment: boolean) => (
    <div className={`group flex items-end ${isOwn ? "justify-end" : "justify-start"} ${isAttachment && textBubble ? "mb-2" : ""}`}>
      {node}
    </div>
  );

  return (
    <div className="flex flex-col">
      {attachmentCard && renderRow(attachmentCard, true)}
      {textBubble && renderRow(textBubble, false)}
      {renderContextMenu()}
    </div>
  );
}
