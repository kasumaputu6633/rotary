export type DealStage = "negotiating" | "agreed" | "handover_scheduled";
export type DealStatus = "active" | "completed" | "cancelled";

export const dealStageOptions: Array<{ value: DealStage; label: string; description: string }> = [
  {
    value: "negotiating",
    label: "Masih dibicarakan",
    description: "Detail harga, waktu, atau serah terima belum final.",
  },
  {
    value: "agreed",
    label: "Sudah sepakat",
    description: "Kedua pihak sudah menyetujui detail utama.",
  },
  {
    value: "handover_scheduled",
    label: "Serah terima dijadwalkan",
    description: "Waktu dan cara penyerahan barang sudah ditentukan.",
  },
];

export const handoverMethodOptions = [
  { value: "", label: "Belum ditentukan" },
  { value: "pickup", label: "Diambil peminat" },
  { value: "meetup", label: "Titik temu" },
  { value: "delivery", label: "Dikirim manual" },
  { value: "other", label: "Cara lain" },
] as const;

export function formatDealStage(stage: DealStage) {
  return dealStageOptions.find((option) => option.value === stage)?.label ?? "Masih dibicarakan";
}

export function formatDealStatus(status: DealStatus) {
  if (status === "completed") return "Selesai";
  if (status === "cancelled") return "Dibatalkan";
  return "Berjalan";
}

export function formatHandoverMethod(method?: string | null) {
  return handoverMethodOptions.find((option) => option.value === method)?.label ?? "Belum ditentukan";
}

export function formatDealSchedule(value?: Date | null) {
  if (!value) return "Belum dijadwalkan";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(value);
}

export function toDateTimeLocalValue(value?: Date | null) {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Makassar",
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
