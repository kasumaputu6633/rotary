"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 3_000;

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
};

export type ConversationInfo = {
  id: string;
  listingId: string | null;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
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

export function useConversation(conversationId: string | null, currentUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

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
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) setError("Conversation tidak ditemukan");
          else if (res.status === 401) setError("Silakan login untuk membuka chat");
          return;
        }

        const data = await res.json();

        setConversation(data.conversation);
        setOtherUser(data.otherUser);
        setError(null);

        if (data.messages.length > 0) {
          if (isIncremental) {
            setMessages((prev) => {
              const newMsgs = data.messages.filter(
                (m: ChatMessage) => !prev.some((p) => p.id === m.id)
              );
              return [...prev, ...newMsgs];
            });
          } else {
            setMessages(data.messages);
          }
          lastMessageIdRef.current = data.messages.at(-1)?.id ?? lastMessageIdRef.current;
        }
      } catch {
        // Ignore saat polling
      }
    },
    [conversationId],
  );

  // Load awal + mulai polling
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!conversationId) {
      setMessages([]);
      setOtherUser(null);
      setConversation(null);
      setError(null);
      stopPolling();
      return;
    }

    isFirstLoad.current = true;
    lastMessageIdRef.current = null;
    setLoading(true);
    setMessages([]);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    let stopped = false;

    async function poll() {
      if (stopped) return;

      if (isFirstLoad.current) {
        await fetchMessages(false);
        isFirstLoad.current = false;
        setLoading(false);
      } else {
        await fetchMessages(true);
      }

      if (!stopped) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      stopped = true;
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
        return true;
      } catch {
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversationId],
  );

  return {
    messages,
    otherUser,
    conversation,
    loading,
    error,
    sending,
    sendMessage,
  };
}


