"use client";

/* Hallmark · component: confirmation-dialog · genre: utilitarian-marketplace
 * states: default · hover · focus · active · disabled · loading · error · success
 * pre-emit critique: P5 H5 E5 S5 R5 V4 · contrast: pass
 */

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef } from "react";

export type ConfirmDialogTone = "brand" | "accent" | "success" | "danger";

const toneStyles: Record<
  ConfirmDialogTone,
  {
    confirm: string;
    icon: string;
    iconName: string;
  }
> = {
  brand: {
    confirm: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
    icon: "text-[var(--color-brand)]",
    iconName: "lucide:circle-help",
  },
  accent: {
    confirm: "bg-[var(--color-primary)] text-[var(--color-brand)] hover:bg-[var(--color-primary-hover)]",
    icon: "text-[var(--color-primary-hover)]",
    iconName: "lucide:triangle-alert",
  },
  success: {
    confirm: "bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)]",
    icon: "text-[var(--color-success)]",
    iconName: "lucide:circle-check-big",
  },
  danger: {
    confirm: "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)]",
    icon: "text-[var(--color-danger)]",
    iconName: "lucide:trash-2",
  },
};

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  icon?: string;
  isOpen: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pendingLabel?: string;
  title: string;
  tone?: ConfirmDialogTone;
};

export function ConfirmDialog({
  cancelLabel = "Batal",
  confirmLabel = "Lanjutkan",
  description,
  icon,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  pendingLabel = "Memproses...",
  title,
  tone = "brand",
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const isPendingRef = useRef(isPending);
  const onCancelRef = useRef(onCancel);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const styles = toneStyles[tone];

  useEffect(() => {
    isPendingRef.current = isPending;
    onCancelRef.current = onCancel;
  }, [isPending, onCancel]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => cancelButtonRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPendingRef.current) {
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableButtons = [
        cancelButtonRef.current,
        confirmButtonRef.current,
      ].filter((button): button is HTMLButtonElement => Boolean(button && !button.disabled));

      if (focusableButtons.length === 0) {
        event.preventDefault();
        return;
      }

      const firstButton = focusableButtons[0];
      const lastButton = focusableButtons[focusableButtons.length - 1];

      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-enter fixed inset-0 z-[10050] flex items-end justify-center bg-[var(--color-overlay)] p-3 font-open-sauce sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isPending}
        className="modal-panel-enter w-full max-w-[420px] overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_48px_rgb(15_23_42_/_0.22)]"
      >
        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pt-6">

          <div className="flex min-w-0 items-center gap-2.5">
            <Icon icon={icon ?? styles.iconName} width={18} height={18} className={`shrink-0 ${styles.icon}`} aria-hidden="true" />
            <h2 id={titleId} className="min-w-0 text-[16px] font-semibold leading-snug text-[var(--color-text)] [overflow-wrap:anywhere]">
              {title}
            </h2>
          </div>


          <p
            id={descriptionId}
            className="mt-3 whitespace-pre-line text-[12px] leading-[1.65] text-[var(--color-muted)] [overflow-wrap:anywhere] sm:text-[13px]"
          >
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4 sm:px-6">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-[7px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] px-4 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirm}`}
          >
            {isPending ? (
              <Icon icon="lucide:loader-circle" width={15} height={15} className="animate-spin" aria-hidden="true" />
            ) : null}
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
