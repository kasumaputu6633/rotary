"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/account/settings", icon: "lucide:settings-2", label: "Pengaturan akun" },
  { href: "/account/favorites", icon: "lucide:heart", label: "Favorit" },
  { href: "/account/notifications", icon: "lucide:bell-ring", label: "Notifikasi" },
];

const settingsNavigation = [
  { href: "/account/settings?tab=profile", label: "Profil", tab: "profile" },
  { href: "/account/settings?tab=contact", label: "Kontak & Verifikasi", tab: "contact" },
  { href: "/account/settings?tab=security", label: "Keamanan", tab: "security" },
];

const securityNavigation = [
  { href: "/account/settings?tab=security&section=password", label: "Kata sandi", section: "password" },
  { href: "/account/settings?tab=security&section=two-factor", label: "Verifikasi dua langkah", section: "two-factor" },
  { href: "/account/settings?tab=security&section=devices", label: "Perangkat terpercaya", section: "devices" },
  { href: "/account/settings?tab=security&section=activity", label: "Aktivitas login", section: "activity" },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AccountShell({
  avatarUrl,
  children,
  emailVerified,
  name,
  phoneVerified,
}: {
  avatarUrl?: string | null;
  children: ReactNode;
  emailVerified: boolean;
  name: string;
  phoneVerified: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contactComplete = emailVerified && phoneVerified;
  const isSettingsPage = pathname === "/account/settings";
  const settingsTab = searchParams.get("tab") === "contact"
    ? "contact"
    : searchParams.get("tab") === "security" || searchParams.get("tab") === "password"
      ? "security"
      : "profile";
  const securitySection = searchParams.get("section") === "two-factor"
    ? "two-factor"
    : searchParams.get("section") === "devices"
      ? "devices"
      : searchParams.get("section") === "activity"
        ? "activity"
        : "password";

  return (
    <main className="seller-center bg-[#f7f8fa] font-open-sauce text-[var(--seller-ink)]">
      <div className="mx-auto grid max-w-[1280px] gap-5 px-4 py-7 md:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7 lg:py-10">
        <aside className="hidden min-w-0 lg:block">
          <div className="overflow-hidden rounded-[10px] border border-[var(--seller-rule)] bg-white shadow-[var(--seller-shadow)]">
            <div className="flex items-center gap-3 border-b border-[var(--seller-rule)] p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[var(--seller-brand)] text-[13px] font-bold text-white">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  getInitials(name) || "R"
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{name}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--seller-muted)]">
                  Akun Rotary
                </p>
              </div>
            </div>

            <nav className="grid gap-1 p-2" aria-label="Navigasi Akun Saya">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex min-h-11 items-center justify-between gap-3 rounded-[8px] px-3 text-[12px] font-semibold transition-colors ${
                        active
                          ? "bg-[var(--seller-brand)] text-white"
                          : "text-[var(--seller-muted)] hover:bg-[var(--seller-brand-soft)] hover:text-[var(--seller-brand)]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon icon={item.icon} width={16} height={16} aria-hidden="true" />
                        {item.label}
                      </span>
                      {item.href === "/account/settings" && !contactComplete ? (
                        <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-[var(--seller-accent)]"}`} aria-label="Perlu tindakan" />
                      ) : null}
                    </Link>

                    {item.href === "/account/settings" ? (
                      <div className="my-1.5 ml-6 grid gap-1 border-l border-[var(--seller-rule)] pl-2">
                        {settingsNavigation.map((child) => {
                          const childActive = isSettingsPage && settingsTab === child.tab;
                          return (
                            <div key={child.tab}>
                              <Link
                                href={child.href}
                                className={`flex min-h-9 items-center justify-between rounded-[7px] px-2 text-[11px] transition-colors ${
                                  childActive
                                    ? "bg-[var(--seller-accent-soft)] font-semibold text-[var(--seller-brand)]"
                                    : "text-[var(--seller-muted)] hover:bg-[var(--seller-surface-2)] hover:text-[var(--seller-brand)]"
                                }`}
                                aria-current={childActive ? "page" : undefined}
                              >
                                {child.label}
                                {child.tab === "contact" && !contactComplete ? (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--seller-accent)]" aria-label="Perlu tindakan" />
                                ) : null}
                              </Link>
                              {child.tab === "security" && childActive ? (
                                <div className="ml-2 mt-1 grid gap-0.5 border-l border-[var(--seller-rule)] pl-2">
                                  {securityNavigation.map((securityItem) => {
                                    const securityActive = securitySection === securityItem.section;
                                    return (
                                      <Link
                                        key={securityItem.section}
                                        href={securityItem.href}
                                        className={`flex min-h-8 items-center rounded-[6px] px-2 text-[10px] transition-colors ${
                                          securityActive
                                            ? "font-semibold text-[var(--seller-brand)]"
                                            : "text-[var(--seller-muted)] hover:text-[var(--seller-brand)]"
                                        }`}
                                        aria-current={securityActive ? "page" : undefined}
                                      >
                                        {securityItem.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-[var(--seller-rule)] p-3">
              <Link
                href="/dashboard"
                className="flex min-h-11 items-center justify-between gap-3 rounded-[8px] bg-[var(--seller-accent-soft)] px-3 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[#ffe8b7]"
              >
                <span className="flex items-center gap-3">
                  <Icon icon="lucide:store" width={16} height={16} aria-hidden="true" />
                  Seller Center
                </span>
                <Icon icon="lucide:arrow-up-right" width={14} height={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <nav className="mb-5 flex gap-2 overflow-x-auto lg:hidden" aria-label="Navigasi cepat Akun Saya">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[8px] px-3 text-[12px] font-semibold ${
                    active
                      ? "bg-[var(--seller-brand)] text-white"
                      : "border border-[var(--seller-rule)] bg-white text-[var(--seller-muted)]"
                  }`}
                >
                  <Icon icon={item.icon} width={14} height={14} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </main>
  );
}
