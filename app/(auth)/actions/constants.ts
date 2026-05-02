export type ActionResult = { error?: string; redirectTo?: string } | undefined;

export const DB_ERROR = "Terjadi kesalahan server. Silakan coba beberapa saat lagi.";

export const COOKIE = {
  session: { httpOnly: true, maxAge: 60 * 60 * 24 * 7,  path: "/" },
  device:  { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" },
  pending: { httpOnly: true, maxAge: 60 * 10,            path: "/" },
} as const;
