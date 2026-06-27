import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

export function ProductsFilterDrawer({
  activeFilterCount,
  children,
}: {
  activeFilterCount: number;
  children: ReactNode;
}) {
  return (
    <details className="group mb-3 lg:hidden">
      <summary className="flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] bg-white px-4 font-open-sauce text-[12px] font-semibold text-[#17458f] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:bg-[#eef6ff] [&::-webkit-details-marker]:hidden">
        <Icon icon="lucide:sliders-horizontal" width={15} height={15} aria-hidden="true" />
        Filter listing
        {activeFilterCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f7a81b] px-1.5 text-[10px] font-semibold text-white">
            {activeFilterCount}
          </span>
        ) : null}
        <Icon icon="lucide:chevron-down" width={15} height={15} className="transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
