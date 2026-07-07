export type ComplaintTargetType = "listing" | "user" | "deal" | "waste_location";
export type ComplaintStatus = "new" | "reviewing" | "resolved" | "rejected";
export type ComplaintPriority = "low" | "medium" | "high";

export function formatComplaintCode(seq: number): string {
  return `KMP-${String(seq).padStart(3, "0")}`;
}

export function formatComplaintTarget(type: ComplaintTargetType): string {
  if (type === "listing") return "Listing";
  if (type === "user") return "Pengguna";
  if (type === "waste_location") return "Lokasi Limbah";
  return "Transaksi";
}

export function formatComplaintStatus(status: ComplaintStatus): string {
  if (status === "new") return "Baru";
  if (status === "reviewing") return "Ditinjau";
  if (status === "resolved") return "Selesai";
  return "Ditolak";
}

export function formatComplaintPriority(priority: ComplaintPriority): string {
  if (priority === "low") return "Rendah";
  if (priority === "medium") return "Sedang";
  return "Tinggi";
}

// Kategori laporan yang bisa dipilih pengguna saat melapor.
export const COMPLAINT_CATEGORIES = [
  "Dugaan penipuan",
  "Barang terlarang",
  "Barang tidak sesuai",
  "Salah kategori",
  "Konten tidak pantas",
  "Pelecehan atau spam",
  "Lainnya",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];
