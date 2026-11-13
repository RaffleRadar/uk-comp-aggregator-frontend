import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/Footer";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <RequireAuth>{children}</RequireAuth>
        </div>
        <Footer />
      </div>
    </AppShell>
  );
}
