import {
  AlertsLanding,
  buildAlertsLandingMetadata,
} from "@/components/landing/alerts-landing";

export const metadata = buildAlertsLandingMetadata(
  "RaffleRadar | Get alerts before the best competitions sell out",
  "Free alerts when great prizes still have low entries. Compare UK prize competitions in one place.",
);

export default function Page() {
  return (
    <AlertsLanding
      campaign="alerts-v1"
      headline="Find better competitions."
      highlight="Get alerts before you miss them."
      intro="RaffleRadar tracks UK prize competitions in one place, compares them instantly, and alerts you when great prizes still have low entries."
    />
  );
}
