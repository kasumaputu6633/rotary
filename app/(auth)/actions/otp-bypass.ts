const OTP_BYPASS_CONTACTS = new Set([
  "putunandadps@gmail.com",
  "putunandadps@gamil.com",
]);

export function canBypassOtp(contact?: string | null) {
  return !!contact && OTP_BYPASS_CONTACTS.has(contact.trim().toLowerCase());
}
