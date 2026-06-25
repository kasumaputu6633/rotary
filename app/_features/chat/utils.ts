import { getOnlineStatus } from "./hooks/useConversation";

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function onlineLabel(lastSeenAt: string | null): string {
  const status = getOnlineStatus(lastSeenAt);
  if (status === "online") return "Online sekarang";
  if (status === "recent") {
    const diffMin = Math.round((Date.now() - new Date(lastSeenAt!).getTime()) / 60_000);
    return `Aktif ${diffMin} menit lalu`;
  }
  if (status === "offline" && lastSeenAt) {
    const d = new Date(lastSeenAt);
    return `Terakhir aktif ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
  }
  return "Status tidak diketahui";
}
