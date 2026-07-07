"use client";

import { Icon } from "@iconify/react";

export type AuthMethod = "email" | "phone";

type AuthMethodTabsProps = {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
};

export default function AuthMethodTabs({ value, onChange }: AuthMethodTabsProps) {
  const tabs: { id: AuthMethod; label: string; icon: string }[] = [
    { id: "email", label: "Email", icon: "lucide:mail" },
    { id: "phone", label: "Nomor HP", icon: "lucide:smartphone" },
  ];

  return (
    <div role="tablist" className="flex w-full rounded-[9px] border border-[#979797] bg-[rgba(130,130,130,0.15)] p-1">
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-[6px] h-8 rounded-[7px] text-[13px] font-open-sauce font-medium transition-all ${
              isActive
                ? "bg-white text-[#17458f] shadow-sm"
                : "text-[#505050] hover:text-black"
            }`}
          >
            <Icon icon={tab.icon} width={16} height={16} aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
