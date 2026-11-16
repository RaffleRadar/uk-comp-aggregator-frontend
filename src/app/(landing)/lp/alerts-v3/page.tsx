import {
  AlertsLanding,
  buildAlertsLandingMetadata,
} from "@/components/landing/alerts-landing";

export const metadata = buildAlertsLandingMetadata(
  "RaffleRadar | Find the prizes you want. Compare before you enter.",
  "Compare ticket prices, odds and closing dates for UK prize competitions from vetted operators, all in one place on RaffleRadar.",
);

export default function Page() {
  return (
    <AlertsLanding
      campaign="alerts-v3"
      headline="Find the prizes you want."
      highlight="Compare before you enter."
      intro="Compare ticket prices, odds and closing dates for UK prize competitions from vetted operators, all in one place on RaffleRadar."
    />
  );
}
