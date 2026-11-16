import {
  AlertsLanding,
  buildAlertsLandingMetadata,
} from "@/components/landing/alerts-landing";

export const metadata = buildAlertsLandingMetadata(
  "RaffleRadar | Find undersold draws. Get alerts before they close.",
  "RaffleRadar shows you which UK prize draws have sold the smallest share of their tickets and when each one closes.",
);

export default function Page() {
  return (
    <AlertsLanding
      campaign="alerts-v2"
      headline="Find undersold draws."
      highlight="Get alerts before they close."
      intro="RaffleRadar shows you which UK prize draws have sold the smallest share of their tickets and when each one closes."
    />
  );
}
