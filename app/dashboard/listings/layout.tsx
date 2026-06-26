import type { ReactNode } from "react";
import { VerifiedSellerArea } from "../_components/VerifiedSellerArea";

export default function ListingsLayout({ children }: { children: ReactNode }) {
  return <VerifiedSellerArea>{children}</VerifiedSellerArea>;
}
