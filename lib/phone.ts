const INDONESIA_DIAL_CODE = "62";
const INDONESIA_LOCAL_PHONE = /^8\d{8,12}$/;

export function normalizeIndonesianPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith(INDONESIA_DIAL_CODE)) {
    digits = digits.slice(INDONESIA_DIAL_CODE.length);
  }
  digits = digits.replace(/^0+/, "");

  if (!INDONESIA_LOCAL_PHONE.test(digits)) {
    return null;
  }

  return `+${INDONESIA_DIAL_CODE}${digits}`;
}

export function normalizeLocalIndonesianPhone(value: string) {
  return normalizeIndonesianPhone(value)?.slice(INDONESIA_DIAL_CODE.length + 1) ?? null;
}

export function toWhatsAppPhone(phone: string) {
  const normalized = normalizeIndonesianPhone(phone);
  if (!normalized) throw new Error("Nomor HP Indonesia tidak valid.");
  return normalized.slice(1);
}

export function formatIndonesianPhone(phone: string) {
  const normalized = normalizeIndonesianPhone(phone);
  if (!normalized) return phone;

  const local = normalized.slice(3);
  if (local.length <= 3) return `+62 ${local}`;
  if (local.length <= 7) return `+62 ${local.slice(0, 3)}-${local.slice(3)}`;
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
}

export function maskContact(contact: string) {
  if (contact.includes("@")) {
    const [local, domain] = contact.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  }

  const normalized = normalizeIndonesianPhone(contact);
  if (!normalized) return contact;
  return `${normalized.slice(0, 5)}****${normalized.slice(-3)}`;
}

