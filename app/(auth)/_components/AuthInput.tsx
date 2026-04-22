"use client";

import { InputHTMLAttributes, useState } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#968e8e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="#968e8e" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="#968e8e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AuthInput({ label, error, id, type, ...props }: AuthInputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label htmlFor={id} className="font-poppins font-semibold text-[14px] text-black">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          {...props}
          className={`bg-[rgba(130,130,130,0.27)] border h-8 rounded-[9px] w-full px-3 text-[13px] font-poppins outline-none focus:bg-white transition-colors ${
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
      {error && <p className="font-poppins text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
