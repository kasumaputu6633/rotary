import type { ReactNode } from "react";
import { VerifiedSellerArea } from "../_components/VerifiedSellerArea";

export default function DealsLayout({ children }: { children: ReactNode }) {
  return <VerifiedSellerArea>{children}</VerifiedSellerArea>;
}
