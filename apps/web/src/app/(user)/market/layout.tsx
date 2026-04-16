import type { ReactNode } from "react";
import { MarketLayout } from "@/components/layout/market-layout";

export default function MarketModuleLayout({ children }: { children: ReactNode }) {
  return <MarketLayout>{children}</MarketLayout>;
}
