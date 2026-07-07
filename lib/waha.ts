import { toWhatsAppPhone } from "@/lib/phone";

const REQUEST_TIMEOUT_MS = 10_000;

type WahaSession = {
  name: string;
  status: "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";
};

type WahaNumberResult = {
  chatId?: string;
  numberExists: boolean;
};

type WahaMessage = {
  id?: string | Record<string, unknown>;
  to?: string;
};

export type WhatsAppOtpPurpose =
  | "register"
  | "login_verify"
  | "phone_verify"
  | "forgot_password"
  | "two_factor";

export class WahaError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "CONFIG"
      | "UNAVAILABLE"
      | "SESSION_NOT_WORKING"
      | "NUMBER_NOT_FOUND"
      | "SEND_FAILED",
  ) {
    super(message);
    this.name = "WahaError";
  }
}

function getConfig() {
  const url = process.env.WAHA_URL?.replace(/\/+$/, "");
  const apiKey = process.env.WAHA_API_KEY;
  const session = process.env.WAHA_SESSION;

  if (!url || !apiKey || !session) {
    throw new WahaError("Konfigurasi WhatsApp belum lengkap.", "CONFIG");
  }

  return { apiKey, session, url };
}

async function wahaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { apiKey, url } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${url}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Api-Key": apiKey,
        ...init?.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new WahaError(
        response.status >= 500
          ? "Layanan WhatsApp sedang tidak tersedia."
          : "Permintaan WhatsApp ditolak.",
        response.status >= 500 ? "UNAVAILABLE" : "SEND_FAILED",
      );
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof WahaError) throw error;
    throw new WahaError("Tidak dapat terhubung ke layanan WhatsApp.", "UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

export async function getWahaSession() {
  const { session } = getConfig();
  return wahaFetch<WahaSession>(`/api/sessions/${encodeURIComponent(session)}`);
}

export async function assertWahaReady() {
  const currentSession = await getWahaSession();
  if (currentSession.status !== "WORKING") {
    throw new WahaError(
      `Session WhatsApp belum siap (${currentSession.status}).`,
      "SESSION_NOT_WORKING",
    );
  }
  return currentSession;
}

export async function resolveWhatsAppChatId(phone: string) {
  const { session } = getConfig();
  await assertWahaReady();

  const query = new URLSearchParams({
    phone: toWhatsAppPhone(phone),
    session,
  });
  const result = await wahaFetch<WahaNumberResult>(
    `/api/contacts/check-exists?${query.toString()}`,
  );

  if (!result.numberExists || !result.chatId) {
    throw new WahaError(
      "Nomor ini tidak terdaftar atau tidak dapat ditemukan di WhatsApp.",
      "NUMBER_NOT_FOUND",
    );
  }

  return result.chatId;
}

export async function sendWhatsAppText(phone: string, text: string) {
  const { session } = getConfig();
  const chatId = await resolveWhatsAppChatId(phone);

  const result = await wahaFetch<WahaMessage>("/api/sendText", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId,
      text,
      session,
      linkPreview: false,
    }),
  });

  if (!result.id) {
    throw new WahaError("WhatsApp tidak mengembalikan ID pesan.", "SEND_FAILED");
  }

  return result;
}

function otpMessage(code: string, purpose: WhatsAppOtpPurpose, name?: string | null) {
  const purposeText: Record<WhatsAppOtpPurpose, string> = {
    register: "memverifikasi pendaftaran akun",
    login_verify: "memverifikasi proses masuk",
    phone_verify: "memverifikasi nomor HP akun",
    forgot_password: "mereset kata sandi",
    two_factor: "mengaktifkan verifikasi dua langkah",
  };
  const greeting = name?.trim() ? `Halo ${name.trim()},` : "Halo,";

  return [
    `${greeting}`,
    "",
    `Kode OTP Rotary untuk ${purposeText[purpose]}:`,
    `*${code}*`,
    "",
    "Kode berlaku selama 5 menit dan hanya dapat digunakan satu kali.",
    "Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari Rotary.",
    "",
    "Jika kamu tidak meminta kode ini, abaikan pesan ini.",
  ].join("\n");
}

export async function sendWhatsAppOtp(
  phone: string,
  code: string,
  purpose: WhatsAppOtpPurpose,
  name?: string | null,
) {
  return sendWhatsAppText(phone, otpMessage(code, purpose, name));
}
