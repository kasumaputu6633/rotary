import type { ReactNode } from "react";
import { VerifiedSellerArea } from "../_components/VerifiedSellerArea";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <VerifiedSellerArea>{children}</VerifiedSellerArea>;
}
