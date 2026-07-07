export const CHAT_UNREAD_CHANGED_EVENT = "rotaryChatUnreadChanged";
export const CHAT_CONVERSATION_CHANGED_EVENT = "rotaryChatConversationChanged";

export type ChatUnreadChangedDetail = {
  conversationId?: string;
};

export type ChatConversationChangedDetail = {
  conversationId: string;
};

export function dispatchChatUnreadChanged(detail: ChatUnreadChangedDetail = {}) {
  window.dispatchEvent(new CustomEvent(CHAT_UNREAD_CHANGED_EVENT, { detail }));
}

export function dispatchChatConversationChanged(detail: ChatConversationChangedDetail) {
  window.dispatchEvent(new CustomEvent(CHAT_CONVERSATION_CHANGED_EVENT, { detail }));
}
