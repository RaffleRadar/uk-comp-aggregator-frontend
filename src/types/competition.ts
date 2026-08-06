export type CompetitionOperator = {
  name: string;
  baseUrl?: string;
  avgVr: number | null;
  vrSampleSize: number | null;
};

export type Competition = {
  id: string;
  prize: string;
  imageUrl: string | null;
  ticketPrice: number | string | null;
  ticketsTotal: number | null;
  ticketsLeft?: number | null;
  ticketsSold?: number | null;
  percentSold: number | string | null;
  finalPercentSold?: number | string | null;
  endsAt: string | null;
  createdAt: string;
  isActive?: boolean;
  closedAt?: string | null;
  category: string | null;
  instantPrizes: boolean | null;
  availableToBuy?: boolean | null;
  valueRatio: number | string | null;
  operator?: CompetitionOperator | null;
  prizeValue: number | string | null;
  cashAlternative: number | string | null;
  maxPerPerson: number | null;
  numWinners: number | null;
  prizeMake: string | null;
  prizeModel: string | null;
  description: string | null;
  sourceUrl: string | null;
  commentCount?: number;
};
