"use client";

import { Icon } from "@iconify/react";
import {
  normalizeIndonesianPhone,
  normalizeLocalIndonesianPhone,
} from "@/lib/phone";

type AuthPhoneInputProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  error?: string;
};

// Untuk sekarang Indonesia aja. Nanti kalo udah support negara lain tinggal expand list-nya.
const COUNTRY = { code: "ID", dialCode: "+62", flag: "🇮🇩" };

export default function AuthPhoneInput({ id, label, value, onChange, disabled, error }: AuthPhoneInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Strip leading zero & non-digit (nomor Indonesia biasanya ditulis 08xx, padahal yang valid 8xx setelah +62)
    let next = event.target.value.replace(/\D/g, "");
    if (next.startsWith("0")) next = next.replace(/^0+/, "");
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label htmlFor={id} className="font-open-sauce font-semibold text-[14px] text-black">
        {label}
      </label>
      <div className="flex w-full gap-2">
        {/* Country selector - sekarang fixed +62 doang */}
        <button
          type="button"
          disabled
          className="flex items-center gap-[6px] h-8 px-3 rounded-[9px] border border-[#979797] bg-[rgba(130,130,130,0.27)] text-[13px] font-open-sauce shrink-0 cursor-not-allowed"
          aria-label={`Kode negara ${COUNTRY.code}`}
        >
          <span aria-hidden="true">{COUNTRY.flag}</span>
          <span className="font-medium">{COUNTRY.dialCode}</span>
          <Icon icon="lucide:chevron-down" width={14} height={14} aria-hidden="true" className="opacity-40" />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="81234567890"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`flex-1 bg-[rgba(130,130,130,0.27)] border h-8 rounded-[9px] w-full px-3 text-[13px] font-open-sauce outline-none focus:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-red-500 focus:border-red-500" : "border-[#979797] focus:border-[#17458f]"
          }`}
        />
      </div>
      {error && <p className="font-open-sauce text-[12px] text-red-500">{error}</p>}
    </div>
  );
}

export function getFullPhoneNumber(localNumber: string) {
  return normalizeIndonesianPhone(localNumber) ?? `${COUNTRY.dialCode}${localNumber}`;
}

export function validateIndonesianPhone(localNumber: string) {
  return normalizeLocalIndonesianPhone(localNumber) !== null;
}
