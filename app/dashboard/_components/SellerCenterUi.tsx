import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatListingMode, formatListingStatus, type ListingMode, type ListingStatus } from "@/lib/listing-format";

const panelClass =
  "rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)]";

const badgeToneClass = {
  brand: "bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]",
  accent: "bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]",
  success: "bg-[var(--seller-success-soft)] text-[var(--seller-success)]",
  neutral: "bg-[var(--seller-surface-2)] text-[var(--seller-muted)] ring-1 ring-inset ring-[var(--seller-rule)]",
  danger: "bg-[var(--seller-danger-soft)] text-[var(--seller-danger)]",
};

const statusTone: Record<ListingStatus, keyof typeof badgeToneClass> = {
  active: "success",
  draft: "accent",
  inactive: "neutral",
};

export function PageHeader({
  actions,
  description,
  icon,
  kicker,
  meta,
  title,
}: {
  actions?: ReactNode;
  description: string;
  icon: string;
  kicker: string;
  meta?: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4 border-b border-[var(--seller-rule)] pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--seller-muted)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--seller-accent-soft)] text-[var(--seller-brand)]">
            <Icon icon={icon} width={15} height={15} aria-hidden="true" />
          </span>
          <span>{kicker}</span>
        </div>
        <h1 className="mt-3 min-w-0 text-[30px] font-semibold leading-[1.08] text-[var(--seller-ink)] [overflow-wrap:anywhere] md:text-[36px]">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--seller-muted)] md:text-[14px]">{description}</p>
        {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
    </section>
  );
}

export function Panel({
  actions,
  children,
  className = "",
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className={`${panelClass} ${className}`}>
      {title ? (
        <div className="flex flex-col gap-3 border-b border-[var(--seller-rule)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="text-[11px] font-semibold uppercase text-[var(--seller-muted)]">{eyebrow}</p> : null}
            <h2 className="text-[17px] font-semibold leading-tight text-[var(--seller-ink)]">{title}</h2>
            {description ? <p className="mt-1 text-[12px] leading-relaxed text-[var(--seller-muted)]">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeToneClass;
}) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeToneClass[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  return <Badge tone={statusTone[status]}>{formatListingStatus(status)}</Badge>;
}

export function ModeBadge({ mode }: { mode: ListingMode }) {
  return <Badge tone={mode === "sale" ? "accent" : "success"}>{formatListingMode(mode)}</Badge>;
}

export function PrimaryLink({
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--seller-accent)] px-4 text-[12px] font-semibold text-white shadow-[var(--seller-shadow-tight)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
    >
      <Icon icon={icon} width={15} height={15} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function SecondaryLink({
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-4 text-[12px] font-semibold text-[var(--seller-brand)] transition hover:bg-[var(--seller-brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--seller-focus)]"
    >
      <Icon icon={icon} width={15} height={15} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function IconButton({
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
      className="group inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--seller-brand)] transition hover:text-[var(--seller-accent)]"
    >
      {children}
      <Icon icon={icon} width={14} height={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export function ListingThumb({
  imageUrl,
  muted = false,
}: {
  imageUrl?: string | null;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--seller-rule)] ${
        muted ? "bg-[var(--seller-paper-2)] text-[var(--seller-muted)]" : "bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]"
      }`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon icon={muted ? "lucide:archive" : "lucide:image"} width={22} height={22} aria-hidden="true" />
      )}
    </div>
  );
}

export function EmptyState({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: string;
  title: string;
}) {
  return (
    <div className="grid min-h-[280px] place-items-center px-5 py-12 text-center">
      <div>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]">
          <Icon icon={icon} width={25} height={25} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-[var(--seller-ink)]">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-[var(--seller-muted)]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

export function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface-2)] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold text-[var(--seller-muted)]">{label}</p>
        <Icon icon={icon} width={15} height={15} className="text-[var(--seller-brand)]" aria-hidden="true" />
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none text-[var(--seller-ink)]">{value}</p>
    </div>
  );
}
