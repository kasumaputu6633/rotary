import { Icon } from "@iconify/react";
import Link from "next/link";

export type AccountSettingsTab = "profile" | "contact" | "security";

const tabs: {
  href: string;
  icon: string;
  label: string;
  value: AccountSettingsTab;
}[] = [
  {
    href: "/account/settings?tab=profile",
    icon: "lucide:user-round",
    label: "Profil",
    value: "profile",
  },
  {
    href: "/account/settings?tab=contact",
    icon: "lucide:shield-check",
    label: "Kontak & Verifikasi",
    value: "contact",
  },
  {
    href: "/account/settings?tab=security",
    icon: "lucide:lock-keyhole",
    label: "Keamanan",
    value: "security",
  },
];

export function AccountSettingsTabs({
  activeTab,
  contactComplete,
}: {
  activeTab: AccountSettingsTab;
  contactComplete: boolean;
}) {
  return (
    <nav className="flex overflow-x-auto border-b border-[var(--seller-rule)] px-2 sm:px-4" aria-label="Bagian pengaturan akun">
      {tabs.map((tab) => {
        const active = activeTab === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={`relative inline-flex min-h-14 shrink-0 items-center gap-2 px-3 text-[12px] font-semibold transition-colors sm:px-4 ${
              active
                ? "text-[var(--seller-brand)]"
                : "text-[var(--seller-muted)] hover:text-[var(--seller-brand)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon icon={tab.icon} width={15} height={15} aria-hidden="true" />
            {tab.label}
            {tab.value === "contact" && !contactComplete ? (
              <span className="h-2 w-2 rounded-full bg-[var(--seller-accent)]" aria-label="Perlu tindakan" />
            ) : null}
            {active ? (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--seller-brand)] sm:inset-x-4" aria-hidden="true" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
