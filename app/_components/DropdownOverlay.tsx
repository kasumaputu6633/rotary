"use client";

import { useState, useEffect } from "react";

export default function DropdownOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    function handleToggle(event: Event) {
      const customEvent = event as CustomEvent;
      const nextIsOpen = Boolean(customEvent.detail.isOpen);

      if (nextIsOpen) {
        setIsMounted(true);
        requestAnimationFrame(() => setIsOpen(true));
      } else {
        setIsOpen(false);
      }
    }

    window.addEventListener("profileDropdownToggle", handleToggle);
    return () => window.removeEventListener("profileDropdownToggle", handleToggle);
  }, []);

  useEffect(() => {
    if (isOpen || !isMounted) return;

    const timeout = window.setTimeout(() => setIsMounted(false), 180);
    return () => window.clearTimeout(timeout);
  }, [isOpen, isMounted]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/35 backdrop-blur-[1px] z-[950] transition-opacity duration-[180ms] ease-out ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => {
        window.dispatchEvent(new Event("navbarDropdownClose"));
        const event = new CustomEvent("profileDropdownToggle", { detail: { isOpen: false } });
        window.dispatchEvent(event);
      }}
    />
  );
}
