import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/Footer";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <RequireAuth>{children}</RequireAuth>
      <Footer compact />
    </AppShell>
  );
}
