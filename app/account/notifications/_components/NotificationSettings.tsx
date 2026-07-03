"use client";

import { Icon } from "@iconify/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveNotificationPreferencesAction } from "../actions";
import type { NotificationPreferences } from "@/lib/notifications";

type ToggleKey = keyof NotificationPreferences;

const toggleGroups: {
  key: ToggleKey;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    key: "favorites",
    icon: "lucide:heart",
    title: "Barang favorit",
    description:
      "Kabar saat barang yang kamu favoritkan dipesan, terjual, atau harganya turun.",
  },
  {
    key: "listingActivity",
    icon: "lucide:package-check",
    title: "Aktivitas listing",
    description:
      "Pengingat listing dinonaktifkan otomatis karena belum dikonfirmasi.",
  },
];

const lockedGroups: {
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    icon: "lucide:shield-check",
    title: "Keamanan & penindakan",
    description:
      "Login perangkat baru, perubahan kata sandi, dan listing yang diblokir admin. Selalu aktif demi keamanan akun.",
  },
];

function Toggle({
  on,
  disabled,
  onClick,
  label,
}: {
  on: boolean;
  disabled?: boolean;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-[var(--seller-brand)]" : "bg-[var(--seller-rule-strong)]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
          on ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

export function NotificationSettings({
  initialPreferences,
}: {
  initialPreferences: NotificationPreferences;
}) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(initialPreferences);
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: ToggleKey) {
    const next = { ...prefs, [key]: !prefs[key] };
    const previous = prefs;
    setPrefs(next); // optimistik
    startTransition(async () => {
      try {
        await saveNotificationPreferencesAction(next);
        toast.success("Preferensi notifikasi disimpan.");
      } catch {
        setPrefs(previous); // revert bila gagal
        toast.error("Gagal menyimpan preferensi. Coba lagi.");
      }
    });
  }

  return (
    <div className="grid gap-5 p-4 sm:p-5">
      <div className="divide-y divide-[var(--seller-rule)] overflow-hidden rounded-[8px] border border-[var(--seller-rule)]">
        {toggleGroups.map((group) => (
          <div
            key={group.key}
            className="grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-surface-2)] text-[var(--seller-brand)]">
              <Icon icon={group.icon} width={18} height={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{group.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--seller-muted)]">{group.description}</p>
            </div>
            <Toggle
              on={prefs[group.key]}
              disabled={isPending}
              onClick={() => handleToggle(group.key)}
              label={`${group.title} ${prefs[group.key] ? "aktif" : "nonaktif"}`}
            />
          </div>
        ))}

        {lockedGroups.map((group) => (
          <div
            key={group.title}
            className="grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-surface-2)] text-[var(--seller-brand)]">
              <Icon icon={group.icon} width={18} height={18} aria-hidden="true" />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--seller-ink)]">
                {group.title}
                <Icon icon="lucide:lock" width={12} height={12} className="text-[var(--seller-muted)]" aria-hidden="true" />
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--seller-muted)]">{group.description}</p>
            </div>
            <Toggle on disabled label={`${group.title} selalu aktif`} />
          </div>
        ))}
      </div>

      <p className="text-[10px] leading-relaxed text-[var(--seller-muted)]">
        Notifikasi keamanan dan penindakan selalu aktif dan tidak dapat dimatikan.
      </p>
    </div>
  );
}
