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

  if (now - last < COOLDOWN[name]) return;

  lastPlayedAt[name] = now;

  const audio = getAudio(`/sounds/sfx-${name}.mp3`);
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Browser memblokir autoplay sebelum ada interaksi user — diam saja
  });
}
