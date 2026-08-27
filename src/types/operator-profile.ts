// src/types/operator-profile.ts

import type { PortableTextBlock } from "@portabletext/types";

export type OperatorProfile = {
  operatorId?: string | null;
  operatorName?: string | null;
  logo?: unknown;
  registeredCompanyName?: string | null;
  companiesHouseNumber?: string | null;
  foundedYear?: number | null;
  location?: string | null;
  verified?: boolean | null;
  drawMethod?: string[] | null;
  drawSchedule?: string[] | null;
  freeEntryUrl?: string | null;
  postalFreeEntry?: boolean | null;
  paymentMethods?: string[] | null;
  prizeDelivery?: string | null;
  voluntaryCodeMembership?: string | null;
  responsiblePlayControls?: string[] | null;
  publicEntryLists?: boolean | null;
  winnersPublished?: boolean | null;
  shortDescription?: string | null;
  fullProfile?: PortableTextBlock[] | null;
  pros?: string[] | null;
  cons?: string[] | null;
  bestFor?: string | null;
  trustpilotUrl?: string | null;
  trustpilotScore?: number | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  supportEmail?: string | null;
};

const DRAW_METHOD_LABELS: Record<string, string> = {
  live: "Live draw",
  rng: "RNG",
  "google-rng": "Google RNG",
  "third-party": "Third party draw service",
  instant: "Instant win",
  other: "Other",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
  paypal: "PayPal",
  klarna: "Klarna",
  clearpay: "Clearpay",
  "bank-transfer": "Bank transfer",
  wallet: "Site wallet",
};

export function formatDrawMethods(values?: string[] | null) {
  if (!values?.length) return [];
  return values.map((value) => DRAW_METHOD_LABELS[value] ?? value);
}

export function formatPaymentMethods(values?: string[] | null) {
  if (!values?.length) return [];
  return values.map((value) => PAYMENT_METHOD_LABELS[value] ?? value);
}

export function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: value >= 1000 ? 0 : 2,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

export function yesNo(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}
