"use client";

import { useState, useRef } from "react";

export function useOtpInput(length = 6) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = otp.every((d) => d !== "");
  const code = otp.join("");

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    const next = Array(length).fill("");
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputs.current[Math.min(digits.length, length - 1)]?.focus();
  }

  function reset() {
    setOtp(Array(length).fill(""));
    inputs.current[0]?.focus();
  }

  return { otp, inputs, handleChange, handleKeyDown, handlePaste, isComplete, code, reset };
}
