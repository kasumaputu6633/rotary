"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SellerToaster } from "./SellerToaster";

type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavigationItem[];
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function isActivePath(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function PartnerLogoLockup({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link href="/" className="flex w-fit items-center gap-2.5" aria-label="PNB × Rotary Seller Center">
        <Image src="/pnb.svg" alt="PNB" width={24} height={24} priority className="h-6 w-6 shrink-0 object-contain" />
        <span className="h-5 w-px shrink-0 bg-[var(--seller-rule-strong)]" aria-hidden="true" />
        <Image src="/rotary-logo.png" alt="Rotary" width={68} height={24} priority className="h-6 w-auto shrink-0 object-contain" />
      </Link>
    );
  }

  return (
    <Link href="/" className="flex w-fit flex-col items-start gap-2" aria-label="PNB × Rotary Seller Center">
      <span className="flex items-center gap-3">
        <Image src="/pnb.svg" alt="PNB" width={36} height={36} priority className="h-9 w-9 shrink-0 object-contain" />
        <span className="h-7 w-px shrink-0 bg-[var(--seller-rule-strong)]" aria-hidden="true" />
        <Image src="/rotary-logo.png" alt="Rotary" width={96} height={36} priority className="h-9 w-auto shrink-0 object-contain" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--seller-brand)]">Seller Center</span>
    </Link>
  );
}

export default function SellerCenterShell({
  children,
  draftCount,
  inactiveCount,
  unreadChatCount,
  userName,
}: {
  children: ReactNode;
  draftCount?: number;
  inactiveCount?: number;
  unreadChatCount?: number;
  userName: string;
}) {
  const pathname = usePathname();
  const initials = getInitials(userName) || "R";

  const navigation: NavigationItem[] = [
    { label: "Beranda", href: "/dashboard", icon: "lucide:home" },
    {
      label: "Listing",
      href: "/dashboard/listings",
      icon: "lucide:package",
      children: [
        { label: "Semua Listing", href: "/dashboard/listings", icon: "lucide:list" },
        { label: "Tambah Barang", href: "/dashboard/listings/new", icon: "lucide:package-plus" },
        { label: "Draft", href: "/dashboard/listings/drafts", icon: "lucide:file", badge: draftCount ? String(draftCount) : undefined },
        { label: "Nonaktif", href: "/dashboard/listings/inactive", icon: "lucide:archive", badge: inactiveCount ? String(inactiveCount) : undefined },
      ],
    },
    { label: "Chat Pembeli", href: "/dashboard/chat", icon: "lucide:messages-square", badge: unreadChatCount ? String(unreadChatCount) : undefined },
    { label: "Favorit", href: "/dashboard/favorites", icon: "lucide:heart" },
    { label: "Profil Lapak", href: "/dashboard/profile", icon: "lucide:user-round-cog" },
  ];

  const mobileNavigation = navigation.flatMap((item) => [
    { ...item, exact: Boolean(item.children) },
    ...(item.children ?? [])
      .filter((child) => child.href !== item.href)
      .map((child) => ({ ...child, exact: true })),
  ]);

  return (
    <div className="seller-center min-h-screen bg-[var(--seller-paper)] font-poppins text-[var(--seller-ink)] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:min-h-0 lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--seller-rule)] bg-[var(--seller-surface)] lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
          <div className="flex items-center border-b border-[var(--seller-rule)] px-5 py-4">
            <PartnerLogoLockup />
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi Lapak Saya">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-[var(--seller-muted)]">Workbench</p>
            <div className="grid gap-1.5">
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className={`group flex h-11 items-center justify-between rounded-[8px] px-3 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] ${
                        active
                          ? "bg-[var(--seller-brand)] text-white shadow-[var(--seller-shadow-tight)]"
                          : "text-[var(--seller-muted)] hover:bg-[var(--seller-brand-soft)] hover:text-[var(--seller-brand)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon icon={item.icon} width={17} height={17} aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-[var(--seller-danger)] text-white"}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {item.children && (
                      <div className="my-1.5 ml-6 grid gap-1 border-l border-[var(--seller-rule)] pl-2">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex h-8 items-center justify-between rounded-[8px] px-2 text-[12px] transition-colors ${
                                childActive
                                  ? "bg-[var(--seller-accent-soft)] font-semibold text-[var(--seller-brand)]"
                                  : "text-[var(--seller-muted)] hover:bg-[var(--seller-surface-2)] hover:text-[var(--seller-brand)]"
                              }`}
                            >
                              <span className="truncate">{child.label}</span>
                              {child.badge && (
                                <span className="ml-2 rounded-full bg-[var(--seller-accent-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--seller-brand)]">{child.badge}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[var(--seller-rule)] p-4">
            <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] p-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--seller-brand)]">
                <Icon icon="lucide:handshake" width={15} height={15} aria-hidden="true" />
                Manual deal
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--seller-muted)]">
                Rotary hanya membantu listing dan chat. Deal lanjut antar pengguna.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:flex lg:h-screen lg:min-h-0 lg:flex-col">
          <header className="sticky top-0 z-40 shrink-0 border-b border-[var(--seller-rule)] bg-[var(--seller-surface)]/95 backdrop-blur lg:static">
            <div className="flex h-[78px] items-center gap-3 px-4 md:px-6">
              <div className="lg:hidden">
                <PartnerLogoLockup compact />
              </div>

              <div className="hidden min-w-0 flex-1 md:block">
                <div className="flex h-10 max-w-[560px] overflow-hidden rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface-2)] focus-within:border-[var(--seller-brand)] focus-within:ring-2 focus-within:ring-[var(--seller-accent-soft)]">
                  <span className="flex w-11 items-center justify-center text-[var(--seller-muted)]">
                    <Icon icon="lucide:search" width={17} height={17} aria-hidden="true" />
                  </span>
                  <input
                    className="min-w-0 flex-1 bg-transparent pr-4 text-[13px] outline-none placeholder:text-[var(--seller-muted)]"
                    placeholder="Cari listing, draft, atau chat..."
                    aria-label="Cari listing, draft, atau chat"
                  />
                </div>
              </div>

              <Link
                href="/dashboard/listings/new"
                className="ml-auto hidden h-10 items-center gap-2 rounded-[8px] bg-[var(--seller-accent)] px-4 text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 sm:inline-flex"
              >
                <Icon icon="lucide:package-plus" width={15} height={15} aria-hidden="true" />
                Tambah Barang
              </Link>

              <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]" aria-label="Notifikasi lapak">
                <Icon icon="lucide:bell" width={18} height={18} aria-hidden="true" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--seller-danger)]" />
              </button>

              <div className="flex items-center gap-2 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] py-1 pl-1 pr-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--seller-brand)] text-[12px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-32 truncate text-[13px] font-semibold">{userName}</span>
                  <span className="block text-[10px] text-[var(--seller-muted)]">Lapak Saya</span>
                </span>
                <Icon icon="lucide:chevron-down" width={14} height={14} className="text-[var(--seller-muted)]" aria-hidden="true" />
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-[var(--seller-rule)] px-4 py-2 lg:hidden" aria-label="Navigasi cepat Lapak Saya">
              {mobileNavigation.map((item) => {
                const active = item.exact ? pathname === item.href : isActivePath(pathname, item.href);
                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-[8px] px-3 text-[12px] font-semibold ${
                      active ? "bg-[var(--seller-brand)] text-white" : "bg-[var(--seller-surface-2)] text-[var(--seller-muted)]"
                    }`}
                  >
                    <Icon icon={item.icon} width={14} height={14} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="min-w-0 px-4 py-5 md:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">{children}</main>
        </div>
      </div>
      <SellerToaster />
    </div>
  );
}
