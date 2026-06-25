"use client";

import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchCount() {
    try {
      // Hanya request ke server jika tab sedang aktif / dibuka user
      if (document.visibilityState === "hidden") return true;

      const res = await fetch("/api/chat/unread-count");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      } else if (res.status === 401) {
        // User tidak login, stop polling
        return false;
      }
    } catch {
      // Ignore network errors saat polling
    }
    return true;
  }

  useEffect(() => {
    let stopped = false;

    async function poll() {
      if (stopped) return;
      const shouldContinue = await fetchCount();
      if (shouldContinue && !stopped) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        poll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    poll();

    return () => {
      stopped = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { count };
}
