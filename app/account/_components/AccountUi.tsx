import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AccountPageHeader({
  actions,
  description,
  icon,
  title,
}: {
  actions?: ReactNode;
  description: string;
  icon: string;
  title: string;
}) {
  return (
    <section className="grid gap-4 border-b border-[var(--seller-rule)] pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--seller-brand)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--seller-accent-soft)]">
            <Icon icon={icon} width={16} height={16} aria-hidden="true" />
          </span>
          Akun Saya
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight text-[var(--seller-ink)] md:text-[34px]">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--seller-muted)]">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div> : null}
    </section>
  );
}

export function AccountPanel({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)]">
      {title ? (
        <div className="flex flex-col gap-3 border-b border-[var(--seller-rule)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-[var(--seller-ink)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AccountStatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const style = tone === "success"
    ? "bg-[var(--seller-success-soft)] text-[var(--seller-success)]"
    : tone === "warning"
      ? "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]"
      : "bg-[var(--seller-surface-2)] text-[var(--seller-muted)] ring-1 ring-inset ring-[var(--seller-rule)]";

  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${style}`}>
      {children}
    </span>
  );
}

export function AccountSecondaryLink({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] bg-white px-4 text-[12px] font-semibold text-[var(--seller-brand)] transition-colors hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
    >
      <Icon icon={icon} width={15} height={15} aria-hidden="true" />
      {children}
    </Link>
  );
}
