import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Rotary <noreply@rotary.kasuma.my.id>";

export type OtpEmailType = "register" | "login_verify" | "email_verify";

const EMAIL_SUBJECTS: Record<OtpEmailType, string> = {
  register:     "Kode Verifikasi Pendaftaran — Rotary",
  login_verify: "Verifikasi Perangkat Baru — Rotary",
  email_verify: "Verifikasi Email Akun — Rotary",
};

const EMAIL_MESSAGES: Record<OtpEmailType, string> = {
  register:
    "Terima kasih telah mendaftar di Rotary. Gunakan kode berikut untuk memverifikasi akun Anda.",
  login_verify:
    "Kami mendeteksi percobaan masuk dari perangkat yang belum dikenal. Untuk menjaga keamanan akun Anda, masukkan kode verifikasi berikut.",
  email_verify:
    "Gunakan kode berikut untuk memverifikasi email akun dan membuka akses berjualan di Rotary.",
};

function buildOtpHtml(name: string | null, code: string, type: OtpEmailType): string {
  const greeting = name ? `Halo, <strong>${name}</strong>!` : "Halo!";
  const message = EMAIL_MESSAGES[type];

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:48px 20px">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10)">

          <!-- Header -->
          <tr>
            <td style="background:#f7a81b;padding:28px 40px;text-align:center">
              <span style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:2px;font-family:Arial,sans-serif">
                ROTARY
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px">
              <p style="margin:0 0 16px 0;font-size:16px;color:#222222;line-height:1.5">
                ${greeting}
              </p>
              <p style="margin:0 0 32px 0;font-size:14px;color:#555555;line-height:1.75">
                ${message}
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:#fff8ec;border:2px solid #f7a81b;border-radius:12px;padding:28px 20px;text-align:center">
                    <p style="margin:0 0 10px 0;font-size:11px;color:#968e8e;text-transform:uppercase;letter-spacing:2px">
                      Kode Verifikasi
                    </p>
                    <p style="margin:0;font-size:44px;font-weight:700;color:#f7a81b;letter-spacing:12px;font-family:'Courier New',monospace">
                      ${code}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 6px 0;font-size:12px;color:#968e8e">
                Kode ini berlaku selama <strong style="color:#555555">5 menit</strong>.
              </p>
              <p style="margin:0;font-size:12px;color:#968e8e">
                Jika Anda tidak meminta kode ini, abaikan email ini. Akun Anda tetap aman.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px">
              <div style="height:1px;background:#eeeeee"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#fafafa">
              <p style="margin:0;font-size:11px;color:#bbbbbb;text-align:center">
                © 2025 Rotary. Semua hak dilindungi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  name?: string | null,
): Promise<void> {
  const greeting = name ? `Halo, <strong>${name}</strong>!` : "Halo!";
  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:48px 20px">
      <table width="480" cellpadding="0" cellspacing="0" role="presentation"
        style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10)">
        <tr>
          <td style="background:#f7a81b;padding:28px 40px;text-align:center">
            <span style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:2px">ROTARY</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <p style="margin:0 0 16px 0;font-size:16px;color:#222222;line-height:1.5">${greeting}</p>
            <p style="margin:0 0 32px 0;font-size:14px;color:#555555;line-height:1.75">
              Kami menerima permintaan untuk mereset kata sandi akun Anda. Klik tombol di bawah untuk membuat kata sandi baru.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center">
                  <a href="${resetUrl}" style="display:inline-block;background:#f7a81b;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.5px">
                    Reset Kata Sandi
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 6px 0;font-size:12px;color:#968e8e">
              Link ini berlaku selama <strong style="color:#555555">30 menit</strong>.
            </p>
            <p style="margin:0 0 16px 0;font-size:12px;color:#968e8e">
              Jika Anda tidak meminta reset kata sandi, abaikan email ini. Akun Anda tetap aman.
            </p>
            <p style="margin:0;font-size:11px;color:#bbbbbb;word-break:break-all">
              Atau salin link ini: <a href="${resetUrl}" style="color:#17458f">${resetUrl}</a>
            </p>
          </td>
        </tr>
        <tr><td style="padding:0 40px"><div style="height:1px;background:#eeeeee"></div></td></tr>
        <tr>
          <td style="padding:20px 40px;background:#fafafa">
            <p style="margin:0;font-size:11px;color:#bbbbbb;text-align:center">© 2025 Rotary. Semua hak dilindungi.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

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

export async function sendOtpEmail(
  to: string,
  code: string,
  type: OtpEmailType,
  name?: string | null,
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: EMAIL_SUBJECTS[type],
    html: buildOtpHtml(name ?? null, code, type),
  });

  if (error) {
    console.error("[Resend]", error);
    throw new Error("Gagal mengirim email verifikasi.");
  }
}
