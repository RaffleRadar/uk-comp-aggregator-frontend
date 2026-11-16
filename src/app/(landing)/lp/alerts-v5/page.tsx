import {
  AlertsLanding,
  buildAlertsLandingMetadata,
} from "@/components/landing/alerts-landing";

export const metadata = buildAlertsLandingMetadata(
  "RaffleRadar | See what’s closing today. Catch your favourites in time.",
  "RaffleRadar brings together UK prize draws closing today, so you can quickly compare prizes, ticket prices and how many tickets have sold.",
);

export default function Page() {
  return (
    <AlertsLanding
      campaign="alerts-v5"
      headline="See what’s closing today."
      highlight="Catch your favourites in time."
      intro="RaffleRadar brings together UK prize draws closing today, so you can quickly compare prizes, ticket prices and how many tickets have sold."
    />
  );
}
