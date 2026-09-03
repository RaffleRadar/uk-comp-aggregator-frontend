const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export type UrgencyMessage = {
  text: string;
  tone: "urgent" | "soon" | "calm";
};

function toneFromDiff(diff: number): "urgent" | "soon" | "calm" {
  if (diff < DAY_MS) return "urgent";
  if (diff < 3 * DAY_MS) return "soon";
  return "calm";
}

export function getUrgencyMessage(
  endsAt: string | null,
  percentSold: number | null,
): UrgencyMessage | null {
  if (!endsAt) return null;

  const target = new Date(endsAt).getTime();
  if (!Number.isFinite(target)) return null;

  const diff = target - Date.now();
  if (diff <= 0) return null;

  const tone = toneFromDiff(diff);

  if (diff < 3 * HOUR_MS) {
    return { text: "Last few hours. Once it's drawn, it's gone.", tone };
  }

  if (diff < DAY_MS) {
    return {
      text: "Drawn today. Get your tickets before it's too late.",
      tone,
    };
  }

  if (diff < 3 * DAY_MS) {
    return {
      text: "Closing soon. Tickets usually go quickest at the end.",
      tone,
    };
  }

  if (percentSold !== null && percentSold < 15) {
    return {
      text: "Barely touched. The early bird gets the best odds.",
      tone,
    };
  }

  if (percentSold !== null && percentSold >= 75) {
    return {
      text: "Selling fast. Odds get longer with every ticket sold.",
      tone,
    };
  }

  return {
    text: "Plenty of time. Fewer tickets sold means better odds for you.",
    tone,
  };
}
