import { Icon } from "@iconify/react";

type ActivityItem = {
  createdAt: Date;
  deviceName: string | null;
  event: string;
  id: string;
  ipAddress: string | null;
  method: string | null;
  status: string;
};

const eventCopy: Record<string, { icon: string; label: string }> = {
  login_success: { icon: "lucide:log-in", label: "Login berhasil" },
  login_failed: { icon: "lucide:shield-alert", label: "Percobaan login gagal" },
  login_challenge: { icon: "lucide:mail-check", label: "Kode keamanan diminta" },
  logout: { icon: "lucide:log-out", label: "Keluar dari akun" },
  password_changed: { icon: "lucide:key-round", label: "Kata sandi diubah" },
  password_reset: { icon: "lucide:rotate-ccw-key", label: "Kata sandi direset" },
  two_factor_enabled: { icon: "lucide:shield-check", label: "Verifikasi dua langkah diaktifkan" },
  two_factor_disabled: { icon: "lucide:shield-off", label: "Verifikasi dua langkah dinonaktifkan" },
  device_revoked: { icon: "lucide:monitor-x", label: "Perangkat dikeluarkan" },
  sessions_revoked: { icon: "lucide:log-out", label: "Sesi lain diakhiri" },
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LoginActivityList({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[var(--seller-ink)]">Aktivitas keamanan terbaru</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
          Menampilkan maksimal 30 aktivitas terbaru. Periksa jika ada perangkat atau waktu yang tidak kamu kenali.
        </p>
      </div>

      <div className="divide-y divide-[var(--seller-rule)] overflow-hidden rounded-[8px] border border-[var(--seller-rule)]">
        {activities.length === 0 ? (
          <div className="grid min-h-40 place-items-center p-5 text-center">
            <div>
              <Icon icon="lucide:history" width={24} height={24} className="mx-auto text-[var(--seller-muted)]" aria-hidden="true" />
              <p className="mt-2 text-[11px] text-[var(--seller-muted)]">Belum ada aktivitas login yang tercatat.</p>
            </div>
          </div>
        ) : activities.map((activity) => {
          const copy = eventCopy[activity.event] ?? {
            icon: "lucide:shield",
            label: "Aktivitas keamanan",
          };
          const failed = activity.status === "failed";
          return (
            <div key={activity.id} className="grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <span className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${
                failed
                  ? "bg-[var(--seller-danger-soft)] text-[var(--seller-danger)]"
                  : "bg-[var(--seller-surface-2)] text-[var(--seller-brand)]"
              }`}>
                <Icon icon={copy.icon} width={16} height={16} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{copy.label}</p>
                <p className="mt-1 truncate text-[10px] text-[var(--seller-muted)]">
                  {activity.deviceName ?? "Perangkat tidak dikenal"}
                  {activity.ipAddress ? ` · IP ${activity.ipAddress}` : ""}
                </p>
              </div>
              <time className="text-[10px] text-[var(--seller-muted)]">{formatDate(activity.createdAt)}</time>
            </div>
          );
        })}
      </div>
    </div>
  );
}

