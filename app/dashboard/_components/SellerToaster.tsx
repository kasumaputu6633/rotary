"use client";

import { Toaster } from "sonner";

export function SellerToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          fontFamily: "var(--font-poppins, sans-serif)",
          fontSize: "13px",
          borderRadius: "8px",
        },
      }}
    />
  );
}
