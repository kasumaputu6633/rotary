"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";

function VerificationStep({
  complete,
  description,
  icon,
  label,
}: {
  complete: boolean;
  description: string;
  icon: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${
        complete
          ? "bg-[var(--seller-success-soft)] text-[var(--seller-success)]"
          : "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]"
      }`}>
        <Icon icon={complete ? "lucide:circle-check" : icon} width={17} height={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-[var(--seller-ink)]">{label}</p>
          <span className={`text-[10px] font-semibold ${
            complete ? "text-[var(--seller-success)]" : "text-[var(--seller-muted)]"
          }`}>
            {complete ? "Sudah terverifikasi" : "Belum terverifikasi"}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--seller-muted)]">{description}</p>
      </div>
    </div>
  );
}

export function SellerVerificationGate({
  children,
  emailVerified,
  phoneVerified,
}: {
  children: ReactNode;
  emailVerified: boolean;
  phoneVerified: boolean;
}) {
  return (
    <div className="relative min-h-[calc(100vh-132px)] lg:min-h-full">
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none min-h-full select-none opacity-30 blur-[1px]"
      >
        {children}
      </div>

      <div className="absolute inset-0 z-30 flex items-start justify-center bg-[var(--seller-paper)]/72 px-3 py-8 backdrop-blur-[2px] sm:px-6 sm:py-12">
        <section
          role="alertdialog"
          aria-labelledby="seller-verification-title"
          aria-describedby="seller-verification-description"
          className="w-full max-w-[500px] overflow-hidden rounded-[10px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)]"
        >
          <div className="border-b border-[var(--seller-rule)] px-5 py-5 sm:px-6 sm:py-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-[9px] bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
              <Icon icon="lucide:badge-check" width={22} height={22} aria-hidden="true" />
            </span>
            <h1 id="seller-verification-title" className="mt-4 text-[20px] font-semibold leading-tight text-[var(--seller-ink)]">
              Verifikasi akun untuk mulai berjualan
            </h1>
            <p id="seller-verification-description" className="mt-2 text-[12px] leading-relaxed text-[var(--seller-muted)] sm:text-[13px]">
              Selesaikan verifikasi email dan nomor HP sebelum menerbitkan atau mengelola listing barang di Rotary.
            </p>
          </div>

          <div className="grid gap-2.5 px-5 py-5 sm:px-6">
            <VerificationStep
              complete={emailVerified}
              description="Memastikan akses akun dan pemberitahuan penting tetap aman."
              icon="lucide:mail-check"
              label="Verifikasi email"
            />
            <VerificationStep
              complete={phoneVerified}
              description="Mengaktifkan kontak WhatsApp agar peminat dapat menghubungi lapakmu."
              icon="lucide:smartphone"
              label="Verifikasi nomor HP"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--seller-rule)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-4 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
            >
              Kembali ke beranda
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-brand)] px-4 text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
            >
              Lengkapi verifikasi
              <Icon icon="lucide:arrow-right" width={14} height={14} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
