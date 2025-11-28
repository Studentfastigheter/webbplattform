import type { ReactNode } from "react";

import AdColumnsLayout from "@/components/layout/AdColumnsLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <AdColumnsLayout>{children}</AdColumnsLayout>;
}
