"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { logoutAction } from "@/app/actions";
import { ConfirmDialog } from "@/app/_components/ConfirmDialog";
import { SellerVerificationGate } from "./SellerVerificationGate";
import { SellerToaster } from "./SellerToaster";

type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeTone?: "accent" | "danger" | "neutral";
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
  attentionCount = 0,
  children,
  completedCount,
  draftCount,
  inactiveCount,
  isEmailVerified = false,
  isPhoneVerified = false,
  profileMissingCount,
  reservedCount,
  userAvatarUrl,
  userName,
}: {
  attentionCount?: number;
  children: ReactNode;
  completedCount?: number;
  draftCount?: number;
  inactiveCount?: number;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileMissingCount?: number;
  reservedCount?: number;
  userAvatarUrl?: string | null;
  userName: string;
}) {
  const pathname = usePathname();
  const initials = getInitials(userName) || "R";
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLogoutPending, startLogoutTransition] = useTransition();
  const [profileMenuOpenPath, setProfileMenuOpenPath] = useState<string | null>(null);
  const [isVerificationBannerDismissed, setVerificationBannerDismissed] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const isProfileMenuOpen = profileMenuOpenPath === pathname;
  const needsEmailVerification = !isEmailVerified;
  const needsPhoneVerification = !isPhoneVerified;
  const isSellerReady = isEmailVerified && isPhoneVerified;
  const isRestrictedSellerPage =
    pathname.startsWith("/dashboard/listings")
    || pathname.startsWith("/dashboard/deals")
    || pathname.startsWith("/dashboard/chat");
  const shouldBlockSellerPage = isRestrictedSellerPage && !isSellerReady;
  const showVerificationBanner =
    (needsEmailVerification || needsPhoneVerification)
    && !isVerificationBannerDismissed
    && pathname !== "/dashboard/profile";

  const verificationBanner = needsEmailVerification && needsPhoneVerification
    ? {
        icon: "lucide:shield-check",
        title: "Lengkapi verifikasi untuk mulai berjualan.",
        description: "Verifikasi email dan nomor HP agar kamu siap menerbitkan listing barang.",
      }
    : needsEmailVerification
      ? {
          icon: "lucide:mail-check",
          title: "Verifikasi email untuk mulai berjualan.",
          description: "Amankan akunmu sebelum menerbitkan listing barang di Rotary.",
        }
      : {
          icon: "lucide:phone",
          title: "Verifikasi nomor HP untuk mulai berjualan.",
          description: "Aktifkan kontak WhatsApp agar calon peminat mudah menghubungi kamu.",
        };

  function handleLogout() {
    startLogoutTransition(() => logoutAction());
  }

  const navigation: NavigationItem[] = [
    { label: "Beranda", href: "/dashboard", icon: "lucide:home" },
    {
      label: "Listing",
      href: "/dashboard/listings",
      icon: "lucide:package",
      children: [
        { label: "Semua Listing", href: "/dashboard/listings", icon: "lucide:list" },
        { label: "Tambah Barang", href: "/dashboard/listings/new", icon: "lucide:package-plus" },
        { label: "Dipesan", href: "/dashboard/listings/reserved", icon: "lucide:handshake", badge: reservedCount ? String(reservedCount) : undefined },
        { label: "Selesai", href: "/dashboard/listings/completed", icon: "lucide:circle-check-big", badge: completedCount ? String(completedCount) : undefined },
        { label: "Draft", href: "/dashboard/listings/drafts", icon: "lucide:file", badge: draftCount ? String(draftCount) : undefined },
        { label: "Nonaktif", href: "/dashboard/listings/inactive", icon: "lucide:archive", badge: inactiveCount ? String(inactiveCount) : undefined },
      ],
    },
    {
      label: "Kesepakatan",
      href: "/dashboard/deals",
      icon: "lucide:handshake",
      badge: reservedCount ? String(reservedCount) : undefined,
    },
    { label: "Chat Pembeli", href: "/dashboard/chat", icon: "lucide:messages-square", badge: "Segera", badgeTone: "neutral" },
    {
      label: "Profil Lapak",
      href: "/dashboard/profile",
      icon: "lucide:user-round-cog",
      badge: profileMissingCount ? String(profileMissingCount) : undefined,
      badgeTone: "accent",
    },
  ];

  const mobileNavigation = navigation.flatMap((item) => [
    { ...item, exact: Boolean(item.children) },
    ...(item.children ?? [])
      .filter((child) => child.href !== item.href)
      .map((child) => ({ ...child, exact: true })),
  ]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpenPath(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpenPath(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

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
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon icon={item.icon} width={17} height={17} aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : item.badgeTone === "neutral"
                              ? "bg-[var(--seller-surface-2)] text-[var(--seller-muted)] ring-1 ring-inset ring-[var(--seller-rule)]"
                              : item.badgeTone === "accent"
                                ? "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]"
                                : "bg-[var(--seller-danger)] text-white"
                        }`}>
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
                              className={`flex min-h-10 items-center justify-between rounded-[8px] px-2 text-[12px] transition-colors ${
                                childActive
                                  ? "bg-[var(--seller-accent-soft)] font-semibold text-[var(--seller-brand)]"
                                  : "text-[var(--seller-muted)] hover:bg-[var(--seller-surface-2)] hover:text-[var(--seller-brand)]"
                              }`}
                              aria-current={childActive ? "page" : undefined}
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
                Rotary membantu listing dan pencatatan deal. Kontak serta serah terima tetap antar pengguna.
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

              <form action="/dashboard/listings" className="hidden min-w-0 flex-1 md:block" role="search">
                <div className="flex min-h-11 max-w-[560px] overflow-hidden rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface-2)] focus-within:border-[var(--seller-brand)] focus-within:ring-2 focus-within:ring-[var(--seller-accent-soft)]">
                  <button type="submit" className="flex w-11 items-center justify-center text-[var(--seller-muted)] hover:text-[var(--seller-brand)]" aria-label="Cari listing">
                    <Icon icon="lucide:search" width={17} height={17} aria-hidden="true" />
                  </button>
                  <input
                    name="q"
                    className="min-w-0 flex-1 bg-transparent pr-4 text-[13px] outline-none placeholder:text-[var(--seller-muted)]"
                    placeholder="Cari listing di lapak..."
                    aria-label="Cari listing di lapak"
                  />
                </div>
              </form>

              <Link
                href="/dashboard/listings/new"
                className="ml-auto hidden min-h-11 items-center gap-2 rounded-[8px] bg-[var(--seller-accent)] px-4 text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 sm:inline-flex"
              >
                <Icon icon="lucide:package-plus" width={15} height={15} aria-hidden="true" />
                Tambah Barang
              </Link>

              <Link
                href="/dashboard"
                className="relative flex h-11 w-11 items-center justify-center rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]"
                aria-label={attentionCount > 0 ? `${attentionCount} tugas lapak perlu ditangani` : "Buka ringkasan tugas lapak"}
              >
                <Icon icon="lucide:clipboard-check" width={18} height={18} aria-hidden="true" />
                {attentionCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--seller-danger)] px-1 text-[9px] font-bold leading-none text-white">
                    {attentionCount > 9 ? "9+" : attentionCount}
                  </span>
                ) : null}
              </Link>

              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpenPath((openPath) => openPath === pathname ? null : pathname)}
                  className={`flex items-center gap-2 rounded-[8px] border border-[var(--seller-rule)] py-1 pl-1 pr-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)] ${
                    isProfileMenuOpen ? "bg-[var(--seller-accent-soft)]" : "bg-[var(--seller-surface-2)] hover:bg-[var(--seller-accent-soft)]"
                  }`}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Buka menu akun Seller Center"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[8px] bg-[var(--seller-brand)] text-[12px] font-bold text-white">
                    {userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="hidden min-w-0 justify-items-start text-left sm:grid">
                    <span className="block max-w-32 truncate text-left text-[13px] font-semibold">{userName}</span>
                    <span className="block text-left text-[10px] text-[var(--seller-muted)]">Lapak Saya</span>
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    width={14}
                    height={14}
                    className={`text-[var(--seller-muted)] transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isProfileMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)]" role="menu">
                    <Link
                      href="/account/settings"
                      onClick={() => setProfileMenuOpenPath(null)}
                      className="flex min-h-11 items-center gap-2 px-3 py-2.5 text-[12px] font-semibold text-[var(--seller-ink)] hover:bg-[var(--seller-surface-2)]"
                      role="menuitem"
                    >
                      <Icon icon="lucide:circle-user-round" width={15} height={15} className="text-[var(--seller-brand)]" aria-hidden="true" />
                      Akun Saya
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileMenuOpenPath(null)}
                      className="flex min-h-11 items-center gap-2 px-3 py-2.5 text-[12px] font-semibold text-[var(--seller-ink)] hover:bg-[var(--seller-surface-2)]"
                      role="menuitem"
                    >
                      <Icon icon="lucide:user-round-cog" width={15} height={15} className="text-[var(--seller-brand)]" aria-hidden="true" />
                      Profil Lapak
                    </Link>
                    <Link
                      href="/products"
                      onClick={() => setProfileMenuOpenPath(null)}
                      className="flex min-h-11 items-center gap-2 px-3 py-2.5 text-[12px] font-semibold text-[var(--seller-ink)] hover:bg-[var(--seller-surface-2)]"
                      role="menuitem"
                    >
                      <Icon icon="lucide:store" width={15} height={15} className="text-[var(--seller-brand)]" aria-hidden="true" />
                      Buka Marketplace
                    </Link>
                    <div className="border-t border-[var(--seller-rule)]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpenPath(null);
                          setIsLogoutConfirmOpen(true);
                        }}
                        className="flex min-h-11 w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-semibold text-[var(--seller-danger)] hover:bg-[var(--seller-danger-soft)]"
                        role="menuitem"
                      >
                        <Icon icon="lucide:log-out" width={15} height={15} aria-hidden="true" />
                        Keluar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-[var(--seller-rule)] px-4 py-2 lg:hidden" aria-label="Navigasi cepat Lapak Saya">
              {mobileNavigation.map((item) => {
                const active = item.exact ? pathname === item.href : isActivePath(pathname, item.href);
                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] px-3 text-[12px] font-semibold ${
                      active ? "bg-[var(--seller-brand)] text-white" : "bg-[var(--seller-surface-2)] text-[var(--seller-muted)]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon icon={item.icon} width={14} height={14} aria-hidden="true" />
                    {item.label}
                    {item.badge ? (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : item.badgeTone === "neutral"
                            ? "bg-[var(--seller-surface)] text-[var(--seller-muted)] ring-1 ring-inset ring-[var(--seller-rule)]"
                            : "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]"
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </header>

          {showVerificationBanner ? (
            <div
              role="status"
              className="flex items-center gap-2.5 border-b border-[var(--seller-rule)] bg-[var(--seller-accent-soft)] px-4 py-2 md:gap-3 md:px-6"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--seller-accent)] text-white">
                <Icon icon={verificationBanner.icon} width={14} height={14} aria-hidden="true" />
              </span>
              <p className="flex-1 text-[12px] leading-snug text-[var(--seller-ink)]">
                <strong className="font-semibold">{verificationBanner.title}</strong>{" "}
                <span className="text-[var(--seller-muted)]">
                  {verificationBanner.description}
                </span>
              </p>
              <Link
                href="/account/settings?tab=contact"
                className="hidden shrink-0 items-center gap-1 rounded-[6px] bg-[var(--seller-brand)] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:brightness-110 sm:inline-flex"
              >
                Verifikasi sekarang
                <Icon icon="lucide:arrow-right" width={12} height={12} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => setVerificationBannerDismissed(true)}
                aria-label="Tutup pemberitahuan"
                className="shrink-0 rounded-md p-1 text-[var(--seller-muted)] transition-colors hover:bg-white/60 hover:text-[var(--seller-ink)]"
              >
                <Icon icon="lucide:x" width={14} height={14} aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <main className={`min-w-0 px-4 py-5 md:px-6 lg:min-h-0 lg:flex-1 ${
            shouldBlockSellerPage ? "overflow-hidden" : "lg:overflow-y-auto"
          }`}>
            {shouldBlockSellerPage ? (
              <SellerVerificationGate
                emailVerified={isEmailVerified}
                phoneVerified={isPhoneVerified}
              >
                {children}
              </SellerVerificationGate>
            ) : children}
          </main>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Keluar dari Seller Center?"
        description="Sesi kamu akan diakhiri. Kamu perlu masuk kembali untuk mengelola listing, profil lapak, dan kesepakatan."
        icon="lucide:log-out"
        tone="accent"
        confirmLabel="Ya, Keluar"
        pendingLabel="Keluar..."
        isPending={isLogoutPending}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
      <SellerToaster />
    </div>
  );
}
