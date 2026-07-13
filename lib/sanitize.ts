/**
 * Utilitas sanitasi input teks.
 *
 * Dua mode validasi:
 * - Whitelist ketat (default) → untuk field nama (produk, user, kategori, lokasi).
 *   Hanya izinkan huruf Unicode, angka, combining marks, spasi, dan tanda baca umum.
 * - Blocklist longgar (`narrative: true`) → untuk deskripsi, bio, alamat.
 *   Hanya blokir emoji, kontrol chars, dan karakter tak terlihat.
 */

/**
 * Karakter yang diblokir di field naratif (blocklist):
 * - Control chars (kecuali \t, \n, \r)
 * - C1 control chars
 * - Zero-width & invisible chars
 * - Direktional marks (RTL/LTR)
 * - Variation selectors (emoji style)
 * - Extended Pictographic (emoji utama)
 */
const TEXT_BLOCKED_RE = new RegExp(
  // Control chars (kecuali tab=\u0009, newline=\u000A, CR=\u000D)
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u0080-\\u009F" +
    // Zero-width, invisible, directional marks
    "\\u200B-\\u200F\\u2028-\\u202E\\u2060-\\u206F\\uFEFF" +
    // Variation selectors (emoji modifier style)
    "\\uFE00-\\uFE0F]" +
    // Extended Pictographic mencakup hampir semua emoji modern
    "|\\p{Extended_Pictographic}",
  "u",
);

/**
 * Whitelist untuk field nama:
 * Huruf Unicode (\p{L}), angka (\p{N}), combining marks (\p{M}),
 * spasi, dan tanda baca umum. Semua karakter di luar pola ini ditolak,
 * termasuk emoji dan karakter aneh.
 */
const NAME_SAFE_RE = /^[\p{L}\p{N}\p{M}\s.,'\-()\[\]/&:!?#+%@_"]*$/u;

export type SanitizeOpts = {
  /** Panjang minimum (setelah trim). Default: 1. */
  minLen?: number;
  /** Panjang maksimum (setelah trim). */
  maxLen?: number;
  /**
   * true  → blocklist longgar (emoji + kontrol), cocok untuk deskripsi/bio/alamat.
   * false → whitelist ketat (hanya huruf/angka/tanda baca umum), cocok untuk nama.
   */
  narrative?: boolean;
};

/**
 * Validasi teks dan lempar Error jika tidak lolos.
 * Dipakai di server actions yang langsung throw.
 */
export function assertSafeText(
  value: string,
  label: string,
  opts: SanitizeOpts = {},
): void {
  const { minLen = 1, maxLen, narrative = false } = opts;
  const trimmed = value.trim();

  if (trimmed.length < minLen) {
    throw new Error(`${label} minimal ${minLen} karakter.`);
  }
  if (maxLen !== undefined && trimmed.length > maxLen) {
    throw new Error(`${label} maksimal ${maxLen} karakter.`);
  }

  if (narrative) {
    if (TEXT_BLOCKED_RE.test(trimmed)) {
      throw new Error(
        `${label} mengandung karakter yang tidak diizinkan (emoji atau karakter tersembunyi).`,
      );
    }
  } else {
    if (!NAME_SAFE_RE.test(trimmed)) {
      throw new Error(
        `${label} mengandung karakter yang tidak diizinkan. Gunakan huruf, angka, dan tanda baca umum.`,
      );
    }
  }
}

/**
 * Validasi teks dan kembalikan pesan error (string) jika tidak lolos, atau null jika lolos.
 * Dipakai di fungsi yang mengembalikan `{ error }` alih-alih throw.
 */
export function validateSafeText(
  value: string,
  label: string,
  opts: SanitizeOpts = {},
): string | null {
  try {
    assertSafeText(value, label, opts);
    return null;
  } catch (e: unknown) {
    return e instanceof Error ? e.message : String(e);
  }
}
