"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ProductShareDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export default function ProductShareDialog({
  isOpen,
  onClose,
  title,
}: ProductShareDialogProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareText = `Lihat produk ini di Rotary: ${title}`;

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: "mdi:whatsapp",
      color: "bg-[#25D366] hover:bg-[#20bd5a]",
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " - " + url)}`,
    },
    {
      name: "Facebook",
      icon: "mdi:facebook",
      color: "bg-[#1877F2] hover:bg-[#1664d9]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "X (Twitter)",
      icon: "mdi:twitter",
      color: "bg-[#000000] hover:bg-[#333333]",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram",
      icon: "mdi:telegram",
      color: "bg-[#229ED9] hover:bg-[#1d8fc4]",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return createPortal(
    <div
      className="modal-backdrop-enter fixed inset-0 z-[10050] flex items-center justify-center bg-[var(--color-overlay)] p-4 font-open-sauce sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-panel-enter w-full max-w-[420px] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_48px_rgb(15_23_42_/_0.22)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 id={titleId} className="text-[16px] font-semibold text-[var(--color-text)]">
            Bagikan Produk
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
          >
            <Icon icon="lucide:x" width={18} height={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-6">
            <p className="mb-2.5 text-[13px] font-medium text-[var(--color-text)]">Salin Tautan</p>
            <div className="flex items-center gap-2">
              <div className="flex h-11 flex-1 items-center overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3">
                <p className="truncate text-[13px] text-[var(--color-text)]">{url}</p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[var(--color-brand)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
              >
                <Icon icon={copied ? "lucide:check" : "lucide:copy"} width={16} height={16} />
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[13px] font-medium text-[var(--color-text)]">Atau bagikan ke sosial media</p>
            <div className="flex items-center gap-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 ${link.color}`}
                  title={link.name}
                >
                  <Icon icon={link.icon} width={24} height={24} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
