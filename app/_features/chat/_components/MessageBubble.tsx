import type { ChatMessage } from "../_hooks/useConversation";
import { formatTime } from "../utils";
import Image from "next/image";
import Link from "next/link";

export function MessageBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const { attachment } = msg;
  // Trim whitespace-only content (used for attachment-only messages)
  const content = msg.content.trim();

  const attachmentCard = attachment && (
    <div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
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
            {attachment.price != null && (
              <p className="mt-0.5 text-[13px] font-bold text-[#f7a81b]">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(attachment.price)}
              </p>
            )}
          </div>
        </div>
        {!content && (
          <div className="mt-2 text-right text-[11px] text-[#8a95a6]">{formatTime(msg.createdAt)}</div>
        )}
      </Link>
    </div>
  );

  const textBubble = content ? (
    <div className={`w-fit max-w-[85%] md:max-w-[75%] lg:max-w-[600px] rounded-[18px] px-4 py-2.5 text-[13.5px] leading-relaxed text-black ${
      isOwn ? "ml-auto rounded-tr-[6px] bg-[#eef1f6]" : "rounded-tl-[6px] border border-[#d9e0ea] bg-white shadow-sm"
    }`}>
      {content}
      <div className="mt-1 text-right text-[11px] text-[#8a95a6]">{formatTime(msg.createdAt)}</div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col">
      {attachmentCard}
      {textBubble}
    </div>
  );
}
