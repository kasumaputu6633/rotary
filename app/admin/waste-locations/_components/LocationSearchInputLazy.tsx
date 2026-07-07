"use client";

import dynamic from "next/dynamic";
import type { Props } from "./LocationSearchInput";

// Mapbox Search JS is browser-only — isolate it from SSR, mirroring the seller picker.
const Inner = dynamic(
  () => import("./LocationSearchInput").then((m) => ({ default: m.LocationSearchInput })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[42px] w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
    ),
  }
);

export function LocationSearchInputLazy(props: Props) {
  return <Inner {...props} />;
}
