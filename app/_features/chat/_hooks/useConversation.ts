"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dispatchChatConversationChanged, dispatchChatUnreadChanged } from "../events";
import { playSfx } from "@/lib/sfx";

const POLL_INTERVAL_MS = 3_000;
const FULL_REFRESH_EVERY = 5; // setiap 5 poll incremental, lakukan full refresh untuk sinkronisasi penghapusan

export type MessageAttachment = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  imageUrl: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  attachment: MessageAttachment | null;
  replyToMessage?: {
    id: string;
    content?: string;
    senderId?: string;
    attachment?: MessageAttachment | null;
  } | null;
};

export type OtherUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastSeenAt: string | null;
  isBanned: boolean;
};

export type ConversationInfo = {
  id: string;
  listingId: string | null;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
};

type UseConversationOptions = {
  onConversationRead?: (conversationId: string) => void;
  onConversationChanged?: (conversationId: string) => void;
};

type MessagesResponse = {
  messages: ChatMessage[];
  conversation: ConversationInfo;
  otherUser: OtherUser | null;
  readMessagesCount?: number;
  readMessageIds?: string[];
};

/** Hitung status online berdasarkan lastSeenAt */
export function getOnlineStatus(lastSeenAt: string | null): "online" | "recent" | "offline" | "unknown" {
  if (!lastSeenAt) return "unknown";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffMin = diffMs / 60_000;
  if (diffMin < 3) return "online";
  if (diffMin < 60) return "recent";
  return "offline";
}

export function useConversation(
  conversationId: string | null,
  currentUserId: string,
  options: UseConversationOptions = {},
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const pollCountRef = useRef(0);   // full-refresh setiap FULL_REFRESH_EVERY poll
  const isFirstLoad = useRef(true);
  const callbacksRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const fetchMessages = useCallback(
    async (isIncremental = false) => {
      if (!conversationId) return;

      // Jangan membebani server jika user sedang tidak melihat tab ini
      if (document.visibilityState === "hidden" && isIncremental) return;

      const url = isIncremental && lastMessageIdRef.current
        ? `/api/chat/conversations/${conversationId}/messages?after=${lastMessageIdRef.current}`
        : `/api/chat/conversations/${conversationId}/messages`;

      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) setError("Conversation tidak ditemukan");
          else if (res.status === 401) setError("Silakan login untuk membuka chat");
          return;
        }

        const data = (await res.json()) as MessagesResponse;
        const readMessageIds = new Set(data.readMessageIds ?? []);

        setConversation(data.conversation);
        setOtherUser(data.otherUser);
        setError(null);

        const applyReadReceipts = (items: ChatMessage[]) => {
          if (readMessageIds.size === 0) return items;
          return items.map((msg) =>
            msg.senderId === currentUserId && readMessageIds.has(msg.id)
              ? { ...msg, isRead: true }
              : msg,
          );
        };

        if (isIncremental) {
          // Incremental: hanya tambah pesan baru
          if (data.messages.length > 0) {
            setMessages((prev) => {
              const newMsgs = data.messages.filter(
                (m: ChatMessage) => !prev.some((p) => p.id === m.id)
              );
              const hasIncoming = newMsgs.some((m) => m.senderId !== currentUserId);
              if (hasIncoming) playSfx("message-received");
              return applyReadReceipts([...prev, ...newMsgs]);
            });
            lastMessageIdRef.current = data.messages.at(-1)?.id ?? lastMessageIdRef.current;
          } else if (readMessageIds.size > 0) {
            setMessages((prev) => applyReadReceipts(prev));
          }
        } else {
          // Full refresh: ganti seluruh list — pesan yang dihapus otomatis hilang.
          // Deteksi SFX: bandingkan dengan state sebelumnya.
          setMessages((prev) => {
            const serverIds = new Set(data.messages.map((m) => m.id));
            const prevIds = new Set(prev.map((m) => m.id));
            const hasIncoming = prev.length > 0 && data.messages.some(
              (m) => !prevIds.has(m.id) && m.senderId !== currentUserId,
            );
            if (hasIncoming) playSfx("message-received");
            // Jika tidak ada perubahan sama sekali, kembalikan prev untuk menghindari re-render
            const noChange =
              data.messages.length === prev.length &&
              data.messages.every((m) => serverIds.has(m.id) && prevIds.has(m.id));
            if (noChange && readMessageIds.size === 0) return prev;
            return applyReadReceipts(data.messages);
          });
          if (data.messages.length > 0) {
            lastMessageIdRef.current = data.messages.at(-1)?.id ?? lastMessageIdRef.current;
          }
        }

        if (!isIncremental || (data.readMessagesCount ?? 0) > 0) {
          callbacksRef.current.onConversationRead?.(conversationId);
          dispatchChatUnreadChanged({ conversationId });
        }
      } catch {
        // Ignore saat polling
      }
    },
    [conversationId, currentUserId],
  );

  // Load awal + mulai polling
  useEffect(() => {
    let stopped = false;

    async function poll() {
      if (stopped) return;

      if (isFirstLoad.current) {
        // Load pertama: full refresh
        await fetchMessages(false);
        isFirstLoad.current = false;
        pollCountRef.current = 0;
        setLoading(false);
      } else {
        pollCountRef.current += 1;
        // Setiap FULL_REFRESH_EVERY poll, lakukan full refresh untuk sinkronisasi penghapusan
        const doFull = pollCountRef.current % FULL_REFRESH_EVERY === 0;
        await fetchMessages(!doFull);
      }

      if (!stopped) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    const startTimer = window.setTimeout(() => {
      if (stopped) return;

      if (!conversationId) {
        setMessages([]);
        setOtherUser(null);
        setConversation(null);
        setError(null);
        setLoading(false);
        stopPolling();
        return;
      }

      isFirstLoad.current = true;
      lastMessageIdRef.current = null;
      pollCountRef.current = 0;
      setLoading(true);
      setMessages([]);
      setError(null);
      void poll();
    }, 0);

    return () => {
      stopped = true;
      window.clearTimeout(startTimer);
      stopPolling();
    };
  }, [conversationId, fetchMessages, stopPolling]);

  const sendMessage = useCallback(
    async (content: string, attachmentListingId?: string, replyToMessage?: ChatMessage): Promise<boolean> => {
      if (!conversationId) return false;
      if (!content.trim() && !attachmentListingId) return false;
      
      const tempId = `temp-${Date.now()}`;
      const newMsgOptimistic: ChatMessage = {
        id: tempId,
        conversationId,
        senderId: currentUserId,
        content: content.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
        attachment: null,
        replyToMessage: replyToMessage ? { 
          id: replyToMessage.id, 
          content: replyToMessage.content, 
          senderId: replyToMessage.senderId,
          attachment: replyToMessage.attachment
        } : null,
      };

      setMessages((prev) => [...prev, newMsgOptimistic]);
      setSending(true);
      
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim(),
            ...(attachmentListingId ? { attachmentListingId } : {}),
            ...(replyToMessage ? { replyToMessageId: replyToMessage.id } : {}),
          }),
        });
        
        if (!res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return false;
        }

        const newMsg: ChatMessage = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...newMsg, replyToMessage: m.replyToMessage } : m)));
        lastMessageIdRef.current = newMsg.id;
        callbacksRef.current.onConversationChanged?.(conversationId);
        dispatchChatConversationChanged({ conversationId });
        playSfx("message-sent");
        return true;
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversationId, currentUserId],
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<{ ok: boolean; error?: string }> => {
      if (!conversationId) return { ok: false, error: "Tidak ada percakapan aktif" };

      // Optimistic remove
      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      try {
        const res = await fetch(
          `/api/chat/conversations/${conversationId}/messages?messageId=${encodeURIComponent(messageId)}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          // Restore the message on failure by re-fetching
          await fetchMessages(false);
          return { ok: false, error: body?.error ?? "Gagal menghapus pesan" };
        }

        return { ok: true };
      } catch {
        await fetchMessages(false);
        return { ok: false, error: "Terjadi kesalahan jaringan" };
      }
    },
    [conversationId, fetchMessages],
  );

  return {
    messages,
    otherUser,
    conversation,
    loading,
    error,
    sending,
    sendMessage,
    deleteMessage,
  };
}
