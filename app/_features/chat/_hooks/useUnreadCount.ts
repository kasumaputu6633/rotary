"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_UNREAD_CHANGED_EVENT } from "../events";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      // Hanya request ke server jika tab sedang aktif / dibuka user
      if (document.visibilityState === "hidden") return true;

      const res = await fetch("/api/chat/unread-count", { cache: "no-store" });
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
  }, []);

  useEffect(() => {
    let stopped = false;

    async function poll() {
      if (stopped) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      const shouldContinue = await fetchCount();
      if (shouldContinue && !stopped) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void poll();
      }
    };

    const handleUnreadChanged = () => {
      if (document.visibilityState === "visible") {
        void poll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, handleUnreadChanged);
    void poll();

    return () => {
      stopped = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, handleUnreadChanged);
    };
  }, [fetchCount]);

  return { count };
}
