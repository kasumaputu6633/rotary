"use client";

import { Icon } from "@iconify/react";

type ConfirmListingStatusButtonProps = {
  icon: string;
  label: string;
  confirmMessage?: string;
  className: string;
};

export function ConfirmListingStatusButton({
  icon,
  label,
  confirmMessage,
  className,
}: ConfirmListingStatusButtonProps) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={className}
    >
      <Icon icon={icon} width={13} height={13} aria-hidden="true" />
      {label}
    </button>
  );
}
