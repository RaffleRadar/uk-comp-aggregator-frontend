import type { Metadata } from "next";
import { Suspense } from "react";
import { OperatorDashboardView } from "@/components/operator-dashboard/operator-dashboard-view";

export const metadata: Metadata = {
  title: "Operator dashboard | RaffleRadar",
  robots: { index: false, follow: false },
};

export default function OperatorDashboardPage() {
  return (
    <Suspense fallback={null}>
      <OperatorDashboardView />
    </Suspense>
  );
}
