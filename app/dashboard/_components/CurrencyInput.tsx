"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Format angka menjadi string dengan separator titik ribuan Indonesia.
 * Contoh: 33749000 → "33.749.000"
 */
function formatCurrency(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Parse string formatted (mungkin ada titik/koma/spasi) menjadi angka mentah.
 * Hanya ambil digit, strip sisanya.
 */
function parseRawNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

type CurrencyInputProps = {
  className?: string;
  defaultValue?: number | string | null;
  disabled?: boolean;
  name: string;
  placeholder?: string;
  required?: boolean;
};

/**
 * Input harga Rupiah dengan:
 * - Prefix "Rp" visual di kiri
 * - Auto-format separator titik ribuan saat mengetik
 * - Hanya menerima digit (karakter non-angka otomatis di-strip)
 * - Hidden input dengan value raw numeric (tanpa titik) untuk dikirim ke server
 */
export function CurrencyInput({
  className = "",
  defaultValue,
  disabled = false,
  name,
  placeholder = "0",
  required = false,
}: CurrencyInputProps) {
  const initialRaw =
    typeof defaultValue === "number"
      ? defaultValue
      : typeof defaultValue === "string"
        ? parseRawNumber(defaultValue)
        : 0;

  const [displayValue, setDisplayValue] = useState(
    initialRaw > 0 ? formatCurrency(initialRaw) : "",
  );
  const [rawValue, setRawValue] = useState(initialRaw);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const raw = parseRawNumber(input.value);

      // Hitung posisi cursor relatif terhadap digit
      const selectionStart = input.selectionStart ?? 0;
      const beforeCursor = input.value.slice(0, selectionStart);
      const digitsBefore = beforeCursor.replace(/\D/g, "").length;

      const formatted = raw > 0 ? formatCurrency(raw) : "";
      setDisplayValue(formatted);
      setRawValue(raw);

      // Restore cursor position setelah formatting
      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        let digitCount = 0;
        let newCursorPos = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            digitCount++;
          }
          if (digitCount === digitsBefore) {
            newCursorPos = i + 1;
            break;
          }
        }
        if (digitsBefore === 0) newCursorPos = 0;
        if (digitCount < digitsBefore) newCursorPos = formatted.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [],
  );

  return (
    <div
      className={`flex h-11 overflow-hidden rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] transition-colors focus-within:border-[var(--seller-brand)] focus-within:ring-2 focus-within:ring-[var(--seller-accent-soft)] ${
        disabled
          ? "cursor-not-allowed bg-[var(--seller-surface-2)]"
          : ""
      } ${className}`}
    >
      <span
        className={`flex items-center border-r border-[var(--seller-rule)] bg-[var(--seller-surface-2)] px-3 text-[12px] font-semibold ${
          disabled ? "text-[var(--seller-muted)]" : "text-[var(--seller-ink)]"
        }`}
      >
        Rp
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] text-[var(--seller-ink)] outline-none placeholder:text-[var(--seller-muted)] disabled:cursor-not-allowed disabled:text-[var(--seller-muted)]`}
      />
      {/* Hidden input kirim raw number ke server */}
      <input type="hidden" name={name} value={rawValue || ""} />
      {/* Sentinel untuk required validation */}
      {required && (
        <input
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          value={rawValue > 0 ? "ok" : ""}
          onChange={() => {}}
          onInvalid={(e) => {
            (e.target as HTMLInputElement).setCustomValidity(
              "Harga wajib diisi untuk listing yang dijual.",
            );
          }}
          onInput={(e) => {
            (e.target as HTMLInputElement).setCustomValidity("");
          }}
        />
      )}
    </div>
  );
}
