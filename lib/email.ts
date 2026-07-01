import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Rotary <alerts@heyputu.lol>";
const LOGO_URL = "https://heyputu.lol/listings/cf2e6403-b8c2-4b69-a519-978597f993b4/1782908080992-3f8fac25-7b83-46a3-8bb2-f7c28dc40af2-rotary-logo.png";

// Palet warna brand.
const NAVY = "#0B2545";
const BRAND_BLUE = "#17458f";
const ACCENT = "#f7a81b";

export type OtpEmailType =
  | "register"
  | "forgot_password"
  | "login_verify"
  | "email_verify"
  | "two_factor";

const EMAIL_SUBJECTS: Record<OtpEmailType, string> = {
  register: "Kode Verifikasi Pendaftaran — Rotary",
  forgot_password: "Kode Reset Kata Sandi — Rotary",
  login_verify: "Verifikasi Perangkat Baru — Rotary",
  email_verify: "Verifikasi Email Akun — Rotary",
  two_factor: "Aktifkan Verifikasi Dua Langkah — Rotary",
};

const EMAIL_EYEBROWS: Record<OtpEmailType, string> = {
  register: "Verifikasi Pendaftaran",
  forgot_password: "Reset Kata Sandi",
  login_verify: "Verifikasi Masuk",
  email_verify: "Verifikasi Email",
  two_factor: "Verifikasi Dua Langkah",
};

const EMAIL_MESSAGES: Record<OtpEmailType, string> = {
  register:
    "Terima kasih telah mendaftar di Rotary. Gunakan kode di bawah untuk memverifikasi akun Anda.",
  forgot_password:
    "Gunakan kode di bawah untuk memverifikasi permintaan reset kata sandi akun Rotary Anda.",
  login_verify:
    "Kami mendeteksi percobaan masuk dari perangkat yang belum dikenal. Untuk menjaga keamanan akun Anda, gunakan kode di bawah.",
  email_verify:
    "Gunakan kode di bawah untuk memverifikasi email akun dan membuka akses berjualan di Rotary.",
  two_factor:
    "Gunakan kode di bawah untuk mengaktifkan verifikasi dua langkah. Setelah aktif, kode keamanan diminta setiap kali Anda masuk.",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatWibTimestamp(date: Date): string {
  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
  return `${datePart}, ${timePart} WIB`;
}

/**
 * Shell layout bersama untuk semua email transaksional: latar navy, kartu putih
 * beraksen oranye, logo, konten yang di-inject, lalu footer.
 */
function buildEmailShell({
  preheader,
  content,
  recipientEmail,
}: {
  preheader: string;
  content: string;
  recipientEmail?: string | null;
}): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:${NAVY};font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${NAVY}">
    <tr>
      <td align="center" style="padding:40px 20px">

        <!-- Preheader -->
        <p style="margin:0 0 22px 0;font-size:11px;color:#8fa1bd;text-transform:uppercase;letter-spacing:2px;text-align:center">
          ${preheader}
        </p>

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;border-top:4px solid ${ACCENT}">
          <tr>
            <td style="padding:36px 44px 30px 44px">
              <img src="${LOGO_URL}" alt="Rotary" height="40" style="display:block;height:40px;border:0;margin-bottom:30px" />
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:0 44px"><div style="height:1px;background:#e5e9f0"></div></td>
          </tr>
          <tr>
            <td style="padding:22px 44px 30px 44px;text-align:center">
              <p style="margin:0;font-size:11px;color:#9aa7b8">© ${year} Rotary · Semua hak dilindungi</p>
            </td>
          </tr>
        </table>

        ${recipientEmail
      ? `<p style="margin:20px 0 0 0;font-size:11px;color:#6b7d99;text-align:center">Dikirim ke ${escapeHtml(recipientEmail)}</p>`
      : ""
    }

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOtpContent({
  name,
  code,
  type,
  expiryMinutes,
  ipAddress,
  client,
  requestedAt,
}: {
  name: string | null;
  code: string;
  type: OtpEmailType;
  expiryMinutes: number;
  ipAddress: string | null;
  client: string | null;
  requestedAt: Date;
}): string {
  const greeting = name ? `Halo, ${escapeHtml(name)}!` : "Halo!";
  const eyebrow = EMAIL_EYEBROWS[type];
  const message = EMAIL_MESSAGES[type];

  const metaLines = [
    `Diminta · ${formatWibTimestamp(requestedAt)}`,
    ipAddress ? `IP Anda: ${escapeHtml(ipAddress)}` : null,
    client ? `Perangkat: ${escapeHtml(client)}` : null,
  ].filter((line): line is string => line !== null);

  const metaHtml = metaLines
    .map((line, index) => {
      const marginBottom = index === metaLines.length - 1 ? "18px" : "2px";
      return `<p style="margin:0 0 ${marginBottom} 0;font-size:12px;color:#8a97a8">${line}</p>`;
    })
    .join("");

  return `
    <p style="margin:0 0 8px 0;font-size:11px;color:#7c8aa0;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold">
      ${eyebrow}
    </p>
    <h1 style="margin:0 0 18px 0;font-size:24px;color:${BRAND_BLUE};font-weight:bold">
      ${greeting}
    </h1>
    <p style="margin:0 0 30px 0;font-size:14px;color:#3f4d63;line-height:1.75">
      ${message} Kode berlaku selama <strong style="color:${ACCENT}">${expiryMinutes} menit</strong> dan hanya dapat digunakan sekali.
    </p>

    <p style="margin:0 0 30px 0;text-align:center;font-size:38px;font-weight:bold;color:${BRAND_BLUE};letter-spacing:10px">
      ${code}
    </p>

    ${metaHtml}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="border:1px solid #dce3ec;border-radius:8px;padding:16px 18px">
          <p style="margin:0;font-size:12.5px;color:#5a6a82;line-height:1.6">
            Jangan pernah bagikan kode ini. Rotary tidak akan pernah memintanya melalui telepon atau email.
          </p>
        </td>
      </tr>
    </table>`;
}

export async function sendOtpEmail(
  to: string,
  code: string,
  type: OtpEmailType,
  name?: string | null,
  options?: { expiryMinutes?: number; ipAddress?: string | null; client?: string | null },
): Promise<void> {
  const expiryMinutes = options?.expiryMinutes ?? 5;

  const html = buildEmailShell({
    preheader: `Kode sekali pakai · Berlaku ${expiryMinutes} menit`,
    recipientEmail: to,
    content: buildOtpContent({
      name: name ?? null,
      code,
      type,
      expiryMinutes,
      ipAddress: options?.ipAddress ?? null,
      client: options?.client ?? null,
      requestedAt: new Date(),
    }),
  });

  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: EMAIL_SUBJECTS[type],
    html,
  });

  if (error) {
    console.error("[Resend]", error);
    throw new Error("Gagal mengirim email verifikasi.");
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  name?: string | null,
): Promise<void> {
  const greeting = name ? `Halo, ${escapeHtml(name)}!` : "Halo!";

  const content = `
    <p style="margin:0 0 8px 0;font-size:11px;color:#7c8aa0;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold">
      Reset Kata Sandi
    </p>
    <h1 style="margin:0 0 18px 0;font-size:24px;color:${BRAND_BLUE};font-weight:bold">
      ${greeting}
    </h1>
    <p style="margin:0 0 30px 0;font-size:14px;color:#3f4d63;line-height:1.75">
      Kami menerima permintaan untuk mereset kata sandi akun Anda. Klik tombol di bawah untuk membuat kata sandi baru. Tautan berlaku selama <strong style="color:${ACCENT}">30 menit</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:0 0 30px 0">
          <a href="${resetUrl}" style="display:inline-block;background:${ACCENT};color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 40px;border-radius:50px">
            Reset Kata Sandi
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 18px 0;font-size:11px;color:#8a97a8;word-break:break-all">
      Atau salin tautan ini: <a href="${resetUrl}" style="color:${BRAND_BLUE}">${resetUrl}</a>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="border:1px solid #dce3ec;border-radius:8px;padding:16px 18px">
          <p style="margin:0;font-size:12.5px;color:#5a6a82;line-height:1.6">
            Jika Anda tidak meminta reset kata sandi, abaikan email ini. Akun Anda tetap aman.
          </p>
        </td>
      </tr>
    </table>`;

  const html = buildEmailShell({
    preheader: "Tautan reset kata sandi · Berlaku 30 menit",
    recipientEmail: to,
    content,
  });

  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Reset Kata Sandi — Rotary",
    html,
  });

  if (error) {
    console.error("[Resend]", error);
    throw new Error("Gagal mengirim email reset kata sandi.");
  }
}
