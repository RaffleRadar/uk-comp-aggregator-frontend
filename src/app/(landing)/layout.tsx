import type { ReactNode } from "react";
import { GtmLoader } from "@/components/layout/gtm-loader";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ConsentProvider } from "@/contexts/consent-context";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConsentProvider>
        <GtmLoader />
        {children}
      </ConsentProvider>
    </ThemeProvider>
  );
}
