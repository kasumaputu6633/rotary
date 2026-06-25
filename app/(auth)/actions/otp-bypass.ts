const OTP_BYPASS_CONTACTS = new Set([
  "putunandadps@gmail.com",
  "putunandadps@gamil.com",
]);

export function canBypassOtp(contact?: string | null) {
  return process.env.NODE_ENV !== "production"
    && process.env.AUTH_OTP_BYPASS === "true"
    && !!contact
    && OTP_BYPASS_CONTACTS.has(contact.trim().toLowerCase());
}
