export type ActionResult = { error?: string; redirectTo?: string } | undefined;

export const DB_ERROR = "Terjadi kesalahan server. Silakan coba beberapa saat lagi.";

const secureCookie = process.env.NODE_ENV === "production";
const baseCookie = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: secureCookie,
};

export const COOKIE = {
  session: { ...baseCookie, maxAge: 60 * 60 * 24 * 7 },
  device: { ...baseCookie, maxAge: 60 * 60 * 24 * 30 },
  pending: { ...baseCookie, maxAge: 60 * 10 },
} as const;
