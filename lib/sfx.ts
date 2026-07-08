const audioCache = new Map<string, HTMLAudioElement>();

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache.has(src)) {
    audioCache.set(src, new Audio(src));
  }
  return audioCache.get(src)!;
}

export type SfxName = "message-sent" | "message-received" | "notification";

const lastPlayedAt: Partial<Record<SfxName, number>> = {};

// Jeda minimum antar bunyi yang sama (ms)
const COOLDOWN: Record<SfxName, number> = {
  "message-sent": 300,
  "message-received": 1000,
  "notification": 5000,
};

/**
 * Putar sound effect berdasarkan nama.
 * - Hanya berjalan di client (browser)
 * - Cache audio element agar tidak dibuat ulang
 * - Cooldown per-jenis SFX untuk mencegah spam bunyi
 */
export function playSfx(name: SfxName): void {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const last = lastPlayedAt[name] ?? 0;

  // Mencegah double sound: jika 'message-received' baru saja bunyi (user ada di halaman chat),
  // jangan bunyikan 'notification' SFX karena akan terdengar seperti suara yang delay/dobel.
  if (name === "notification") {
    const lastMsgRecv = lastPlayedAt["message-received"] ?? 0;
    if (now - lastMsgRecv < 2000) return;
  }

  if (now - last < COOLDOWN[name]) return;

  lastPlayedAt[name] = now;

  const audio = getAudio(`/sounds/sfx-${name}.mp3`);
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Browser memblokir autoplay sebelum ada interaksi user — diam saja
  });
}

// Preload audio di background saat client-side idle
if (typeof window !== "undefined") {
  const preload = () => {
    getAudio("/sounds/sfx-notification.mp3").load();
    getAudio("/sounds/sfx-message-received.mp3").load();
    getAudio("/sounds/sfx-message-sent.mp3").load();
  };
  
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preload);
  } else {
    setTimeout(preload, 1500);
  }
}
