export type ListingStatus = "draft" | "active" | "inactive";
export type ListingMode = "sale" | "donation";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  condition: string;
  mode: ListingMode;
  status: ListingStatus;
  price: number | null;
  location: string;
  updatedAt: Date;
  publishedAt: Date | null;
  sellerId?: string;
  sellerName: string | null;
  sellerWhatsapp?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  viewCount?: number;
  favoriteCount?: number;
  imageUrl: string | null;
  isFavorite?: boolean;
  handoverOptions?: string[] | null;
};

export function formatPrice(price: number | null, mode: ListingMode) {
  if (mode === "donation") return "Gratis";
  if (!price) return "Hubungi pemilik";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatListingMode(mode: ListingMode) {
  return mode === "sale" ? "Dijual" : "Didonasi";
}

export function formatListingStatus(status: ListingStatus) {
  if (status === "active") return "Aktif";
  if (status === "inactive") return "Nonaktif";
  return "Draft";
}
