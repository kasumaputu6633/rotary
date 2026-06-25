import { getOnlineStatus } from "../_hooks/useConversation";

export function OnlineDot({ lastSeenAt }: { lastSeenAt: string | null }) {
  const status = getOnlineStatus(lastSeenAt);
  if (status === "online") return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#48b461]" title="Online sekarang" />;
  if (status === "recent") return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f59e0b]" title="Baru aktif" />;
  return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#9ca3af]" title="Offline" />;
}
