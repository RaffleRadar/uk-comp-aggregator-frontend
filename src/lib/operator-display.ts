export const MIN_VR_SAMPLE = 5;
export const BEST_VR = 2;
export const GOOD_VR = 3;
export const FAIR_VR = 5;

type NumericValue = number | string | null | undefined;

type OperatorFairness = {
  badgeVariant: "green" | "amber" | "red" | "neutral";
  label: string;
  vrLabel: string;
  description: string;
  value: number | null;
};

function toNumber(value: NumericValue) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function getOperatorFairness(
  avgVr: NumericValue,
  vrSampleSize: NumericValue,
): OperatorFairness {
  const value = toNumber(avgVr);
  const sample = toNumber(vrSampleSize);

  if (value === null || sample === null || sample < MIN_VR_SAMPLE) {
    return {
      badgeVariant: "neutral",
      label: "Not enough data",
      vrLabel: "VR —",
      description: "We need a larger sample before rating this operator fairly.",
      value: null,
    };
  }

  if (value <= BEST_VR) {
    return {
      badgeVariant: "green",
      label: "Best value",
      vrLabel: `VR ${value.toFixed(1)}`,
      description: "Top-value pricing.",
      value,
    };
  }

  if (value <= GOOD_VR) {
    return {
      badgeVariant: "green",
      label: "Good value",
      vrLabel: `VR ${value.toFixed(1)}`,
      description: "Fair, player-friendly pricing overall.",
      value,
    };
  }

  if (value <= FAIR_VR) {
    return {
      badgeVariant: "amber",
      label: "Fair",
      vrLabel: `VR ${value.toFixed(1)}`,
      description: "Reasonable, but the markup is noticeable.",
      value,
    };
  }

  return {
    badgeVariant: "red",
    label: "Poor value",
    vrLabel: `VR ${value.toFixed(1)}`,
    description: "Pricing is steep relative to prize value.",
    value,
  };
}