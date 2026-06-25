import type { ChatMessage } from "../_hooks/useConversation";
import { formatTime } from "../utils";

export function MessageBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  if (isOwn) {
    return (
      <div className="ml-auto max-w-[290px] rounded-[18px] rounded-tr-md bg-[#eef1f6] px-3.5 py-2.5 text-[13px] leading-snug text-black">
        {msg.content}
        <div className="mt-1 text-right text-[11px] text-[#8a95a6]">{formatTime(msg.createdAt)}</div>
      </div>
    );
  }
  return (
    <div className="max-w-[310px] rounded-[18px] rounded-tl-md border border-[#d9e0ea] bg-white px-3.5 py-2.5 text-[13px] leading-snug text-black shadow-sm">
      {msg.content}
      <div className="mt-1 text-right text-[11px] text-[#8a95a6]">{formatTime(msg.createdAt)}</div>
    </div>
  );
}
