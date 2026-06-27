"use client";

import { Icon } from "@iconify/react";
import { InputHTMLAttributes, useState } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  return <Icon icon={open ? "lucide:eye" : "lucide:eye-off"} width={18} height={18} aria-hidden="true" />;
}

export default function AuthInput({ label, error, id, type, ...props }: AuthInputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label htmlFor={id} className="font-open-sauce font-semibold text-[14px] text-black">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          {...props}
          className={`bg-[rgba(130,130,130,0.27)] border h-8 rounded-[9px] w-full px-3 text-[13px] font-open-sauce outline-none focus:bg-white transition-colors ${
            isPassword ? "pr-9" : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-[#979797] focus:border-[#17458f]"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#968e8e] hover:text-[#555] transition-colors"
            tabIndex={-1}
          >
            <EyeIcon open={show} />
          </button>
        )}
      </div>
      {error && <p className="font-open-sauce text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
