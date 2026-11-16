import {
  AlertsLanding,
  buildAlertsLandingMetadata,
} from "@/components/landing/alerts-landing";

export const metadata = buildAlertsLandingMetadata(
  "RaffleRadar | Find smaller ticket pools. See how the odds compare.",
  "RaffleRadar shows how many tickets each draw can sell, so you can compare your odds even if every ticket goes.",
);

export default function Page() {
  return (
    <AlertsLanding
      campaign="alerts-v4"
      headline="Find smaller ticket pools."
      highlight="See how the odds compare."
      intro="RaffleRadar shows how many tickets each draw can sell, so you can compare your odds even if every ticket goes."
    />
  );
}
