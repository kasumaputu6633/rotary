export type ListingStatus = "draft" | "active" | "reserved" | "completed" | "inactive";
export type ListingMode = "sale" | "donation";
export type ContactPreference = "in_app" | "whatsapp";

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
  reservedAt?: Date | null;
  completedAt?: Date | null;
  sellerId?: string;
  sellerName: string | null;
  sellerAvatarUrl?: string | null;
  sellerWhatsapp?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  viewCount?: number;
  favoriteCount?: number;
  imageUrl: string | null;
  isFavorite?: boolean;
  handoverOptions?: string[] | null;
  contactPreference?: ContactPreference;
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

export function formatListingStatus(status: ListingStatus, mode?: ListingMode) {
  if (status === "active") return "Aktif";
  if (status === "reserved") return "Dipesan";
  if (status === "completed") {
    if (mode === "sale") return "Terjual";
    if (mode === "donation") return "Tersalurkan";
    return "Selesai";
  }
  if (status === "inactive") return "Nonaktif";
  return "Draft";
}

const knownPublicLocations = [
  "Tangerang Selatan",
  "Jakarta Selatan",
  "Jakarta Timur",
  "Jakarta Barat",
  "Jakarta Utara",
  "Jakarta Pusat",
  "Yogyakarta",
  "Denpasar",
  "Bandung",
  "Semarang",
  "Surabaya",
  "Makassar",
  "Tangerang",
  "Samarinda",
  "Pontianak",
  "Banjarmasin",
  "Balikpapan",
  "Palembang",
  "Pekanbaru",
  "Padang",
  "Medan",
  "Malang",
  "Bekasi",
  "Bogor",
  "Depok",
  "Solo",
  "Surakarta",
  "Sleman",
  "Bantul",
  "Badung",
  "Gianyar",
  "Tabanan",
  "Jakarta",
].sort((a, b) => b.length - a.length);

const provinceOrCountryNames = new Set([
  "aceh",
  "bali",
  "banten",
  "indonesia",
  "jawa barat",
  "jawa tengah",
  "jawa timur",
  "kalimantan barat",
  "kalimantan selatan",
  "kalimantan timur",
  "kalimantan tengah",
  "kalimantan utara",
  "lampung",
  "riau",
  "sulawesi selatan",
  "sumatera barat",
  "sumatera selatan",
  "sumatera utara",
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLocationText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
}

function toDisplayCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bDki\b/g, "DKI")
    .replace(/\bDi\b/g, "DI");
}

function cleanPublicLocationName(value: string) {
  let clean = normalizeLocationText(value)
    .replace(/\b(provinsi|province)\b/gi, "")
    .replace(/\b\d{4,6}\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,-]+$/g, "");

  for (const name of provinceOrCountryNames) {
    clean = clean.replace(new RegExp(`\\b${escapeRegExp(name)}$`, "i"), "").trim();
  }

  return clean;
}

function getAdministrativeLocation(value: string) {
  const cityMatch = value.match(/\b(?:kota administrasi|kota)\s+([a-z\s.'-]+)/i);
  if (cityMatch?.[1]) return toDisplayCase(cleanPublicLocationName(cityMatch[1]));

  const regencyMatch = value.match(/\b(?:kabupaten|kab\.?)\s+([a-z\s.'-]+)/i);
  if (regencyMatch?.[1]) return `Kab. ${toDisplayCase(cleanPublicLocationName(regencyMatch[1]))}`;

  return null;
}

function getKnownPublicLocation(value: string) {
  return knownPublicLocations.find((location) => {
    const pattern = new RegExp(`\\b${escapeRegExp(location)}\\b`, "i");
    return pattern.test(value);
  }) ?? null;
}

function isAddressDetail(value: string) {
  return /^(jl\.?|jalan|gang|gg\.?|no\.?|nomor|rt\b|rw\b|blok|komplek|perum|desa|kel\.?|kelurahan|kec\.?|kecamatan|dusun|banjar|br\.?)\b/i.test(value);
}

function isPublicLocationCandidate(value: string) {
  const clean = cleanPublicLocationName(value);
  if (!clean || /^\d+$/.test(clean)) return false;
  if (provinceOrCountryNames.has(clean.toLowerCase())) return false;
  return !isAddressDetail(clean);
}

export function formatPublicLocation(location: string | null | undefined) {
  const normalized = normalizeLocationText(location ?? "");
  if (!normalized) return "Lokasi belum tersedia";

  const parts = normalized.split(",").map((part) => cleanPublicLocationName(part)).filter(Boolean);

  for (const part of parts) {
    const administrativeLocation = getAdministrativeLocation(part);
    if (administrativeLocation) return administrativeLocation;
  }

  for (const part of parts) {
    const knownLocation = getKnownPublicLocation(part);
    if (knownLocation) return knownLocation;
  }

  const candidate = parts.find(isPublicLocationCandidate);
  if (candidate) return toDisplayCase(candidate);

  return normalized.slice(0, 64);
}
