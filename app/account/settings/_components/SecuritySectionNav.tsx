import { Icon } from "@iconify/react";
import Link from "next/link";

export type SecuritySection = "password" | "two-factor" | "devices" | "activity";

const sections: {
  href: string;
  icon: string;
  label: string;
  value: SecuritySection;
}[] = [
  {
    href: "/account/settings?tab=security&section=password",
    icon: "lucide:key-round",
    label: "Kata sandi",
    value: "password",
  },
  {
    href: "/account/settings?tab=security&section=two-factor",
    icon: "lucide:shield-check",
    label: "Verifikasi dua langkah",
    value: "two-factor",
  },
  {
    href: "/account/settings?tab=security&section=devices",
    icon: "lucide:monitor-smartphone",
    label: "Perangkat terpercaya",
    value: "devices",
  },
  {
    href: "/account/settings?tab=security&section=activity",
    icon: "lucide:history",
    label: "Aktivitas login",
    value: "activity",
  },
];

export function SecuritySectionNav({
  activeSection,
  twoFactorEnabled,
}: {
  activeSection: SecuritySection;
  twoFactorEnabled: boolean;
}) {
  return (
    <nav
      className="flex overflow-x-auto border-b border-[var(--seller-rule)] bg-white px-2 sm:px-4"
      aria-label="Bagian keamanan akun"
    >
      {sections.map((section) => {
        const active = section.value === activeSection;
        return (
          <Link
            key={section.value}
            href={section.href}
            className={`relative inline-flex min-h-13 shrink-0 items-center gap-2 px-3 text-[11px] font-semibold transition-colors sm:px-4 ${
              active
                ? "text-[var(--seller-brand)]"
                : "text-[var(--seller-muted)] hover:text-[var(--seller-brand)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon icon={section.icon} width={14} height={14} aria-hidden="true" />
            {section.label}
            {section.value === "two-factor" ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] leading-none ${
                  twoFactorEnabled
                    ? "bg-[var(--seller-success-soft)] text-[var(--seller-success)]"
                    : "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]"
                }`}
              >
                {twoFactorEnabled ? "Aktif" : "Nonaktif"}
              </span>
            ) : null}
            {active ? (
              <span
                className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--seller-brand)] sm:inset-x-4"
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
