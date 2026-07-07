"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dispatchChatConversationChanged, dispatchChatUnreadChanged } from "../events";
import { playSfx } from "@/lib/sfx";

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

        if (data.messages.length > 0) {
          if (isIncremental) {
            setMessages((prev) => {
              const newMsgs = data.messages.filter(
                (m: ChatMessage) => !prev.some((p) => p.id === m.id)
              );
              // Bunyikan SFX hanya jika ada pesan baru dari lawan bicara
              const hasIncoming = newMsgs.some((m) => m.senderId !== currentUserId);
              if (hasIncoming) playSfx("message-received");
              return applyReadReceipts([...prev, ...newMsgs]);
            });
          } else {
            setMessages(applyReadReceipts(data.messages));
          }
          lastMessageIdRef.current = data.messages.at(-1)?.id ?? lastMessageIdRef.current;
        } else if (readMessageIds.size > 0) {
          setMessages((prev) => applyReadReceipts(prev));
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
