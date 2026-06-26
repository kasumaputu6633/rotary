export type ConversationSummary = {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  listingSlug: string | null;
  listingImageUrl: string | null;
  buyerId: string;
  buyerName: string | null;
  buyerAvatarUrl: string | null;
  sellerId: string;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  lastMessageAt: string;
  lastMessageContent: string | null;
  unreadCount: number;
  otherUserLastSeenAt: string | null;
};
