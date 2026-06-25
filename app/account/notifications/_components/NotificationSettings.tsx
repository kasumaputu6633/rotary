import { Icon } from "@iconify/react";

const notificationGroups = [
  {
    icon: "lucide:messages-square",
    title: "Chat dan peminat",
    description: "Pesan baru, pertanyaan barang, dan kabar dari calon peminat.",
  },
  {
    icon: "lucide:package-check",
    title: "Aktivitas listing",
    description: "Status listing, barang dipesan, pengingat draft, dan listing lama.",
  },
  {
    icon: "lucide:shield-check",
    title: "Keamanan akun",
    description: "Login baru, perubahan kata sandi, perangkat, dan verifikasi akun.",
  },
  {
    icon: "lucide:leaf",
    title: "Kabar Rotary",
    description: "Informasi marketplace sirkular, donasi, dan lokasi penampung baru.",
  },
];

export function NotificationSettings() {
  return (
    <div className="grid gap-5 p-4 sm:p-5">
      <div className="flex items-start gap-3 rounded-[8px] border border-[var(--seller-accent)] bg-[var(--seller-accent-soft)] p-4">
        <Icon icon="lucide:construction" width={18} height={18} className="mt-0.5 shrink-0 text-[var(--seller-brand)]" aria-hidden="true" />
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--seller-ink)]">Preferensi notifikasi sedang disiapkan</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Struktur ini menjadi preview. Pilihan baru dapat disimpan setelah sistem notifikasi terhubung ke database.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[var(--seller-rule)] overflow-hidden rounded-[8px] border border-[var(--seller-rule)]">
        {notificationGroups.map((group, index) => (
          <div key={group.title} className="grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-surface-2)] text-[var(--seller-brand)]">
              <Icon icon={group.icon} width={18} height={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{group.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--seller-muted)]">{group.description}</p>
            </div>
            <span
              className={`relative h-6 w-11 cursor-not-allowed rounded-full ${
                index === 2 ? "bg-[var(--seller-brand)]" : "bg-[var(--seller-rule-strong)]"
              } opacity-60`}
              aria-label={`${group.title} belum dapat diubah`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow ${index === 2 ? "right-1" : "left-1"}`} />
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] leading-relaxed text-[var(--seller-muted)]">
        Notifikasi keamanan akan selalu aktif dan tidak dapat dimatikan ketika sistem ini diluncurkan.
      </p>
    </div>
  );
}
