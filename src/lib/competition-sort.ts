export type CompetitionSortState = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  excludeInstant?: boolean;
  excludeFree?: boolean;
  spend?: number | null;
};

export type CompetitionSortIdentity =
  | "bestValue"
  | "mostUndersold"
  | "endingSoon"
  | "bestOdds"
  | "fewestTickets"
  | "topPicks"
  | "topPrizes"
  | "sellingFast"
  | "lowestPrice"
  | "highestPrice"
  | "newest"
  | "mostTicketsLeft"
  | "spendOdds"
  | "spendEntries"
  | "spendPrize";

export function formatSpendAmount(amount: number): string {
  return Number.isInteger(amount) ? `£${amount}` : `£${amount.toFixed(2)}`;
}

export const SPEND_OPTIONS = [1, 5, 10, 20, 50, 100] as const;

export function getCompetitionSortIdentity(
  state: CompetitionSortState,
): CompetitionSortIdentity | null {
  const { sortBy, sortOrder, excludeInstant = false, excludeFree = false } = state;

  if (sortBy === "spendOdds") return "spendOdds";
  if (sortBy === "spendEntries") return "spendEntries";
  if (sortBy === "spendPrize") return "spendPrize";

  if ((sortBy === "bestValue" || sortBy === "valueRatio") && sortOrder === "desc") {
    return "bestValue";
  }

  if (sortBy === "opportunityScore" && sortOrder === "desc") {
    return "topPicks";
  }

  if (sortBy === "percentSold" && sortOrder === "asc") {
    if (excludeInstant && excludeFree) {
      return "mostUndersold";
    }

    return "bestOdds";
  }

  if (sortBy === "percentSold" && sortOrder === "desc") {
    return "sellingFast";
  }

  if (sortBy === "prizeValue" && sortOrder === "desc") {
    return "topPrizes";
  }

  if (sortBy === "endsAt" && sortOrder === "asc") {
    return "endingSoon";
  }

  if (sortBy === "ticketsLeft" && sortOrder === "desc") {
    return "mostTicketsLeft";
  }

  if (sortBy === "ticketPrice" && sortOrder === "asc") {
    return "lowestPrice";
  }

  if (sortBy === "ticketPrice" && sortOrder === "desc") {
    return "highestPrice";
  }

  if (sortBy === "createdAt" && sortOrder === "desc") {
    return "newest";
  }

  if (sortBy === "ticketsTotal" && sortOrder === "asc") {
    return "fewestTickets";
  }

  return null;
}

export function getCompetitionSortPresentation(state: CompetitionSortState) {
  const identity = getCompetitionSortIdentity(state);

  if (!identity) {
    return null;
  }

  const amount = state.spend ?? null;
  const amountLabel = amount != null ? formatSpendAmount(amount) : "Spend";

  switch (identity) {
    case "spendOdds":
      return {
        identity,
        label: `Best Odds for ${amountLabel}`,
        headingSuffix: `Best Odds for ${amountLabel}`,
      };
    case "spendEntries":
      return {
        identity,
        label: `Most Entries for ${amountLabel}`,
        headingSuffix: `Most Entries for ${amountLabel}`,
      };
    case "spendPrize":
      return {
        identity,
        label: `Biggest Prize for ${amountLabel}`,
        headingSuffix: `Biggest Prize for ${amountLabel}`,
      };
    case "bestValue":
      return { identity, label: "Best Value", headingSuffix: "By Value" };
    case "mostUndersold":
      return {
        identity,
        label: "Most Undersold",
        headingSuffix: "By Most Undersold",
      };
    case "endingSoon":
      return { identity, label: "Ending Soon", headingSuffix: "By Ending Soon" };
    case "bestOdds":
      return { identity, label: "Best Odds", headingSuffix: "By Best Odds" };
    case "fewestTickets":
      return {
        identity,
        label: "Fewest Total Tickets",
        headingSuffix: "By Ticket Pool",
      };
    case "topPicks":
      return { identity, label: "Top Picks", headingSuffix: "By Top Picks" };
    case "topPrizes":
      return { identity, label: "Top Prizes", headingSuffix: "By Prize Value" };
    case "sellingFast":
      return {
        identity,
        label: "Selling Fast",
        headingSuffix: "By Selling Fast",
      };
    case "lowestPrice":
      return {
        identity,
        label: "Lowest Ticket Price",
        headingSuffix: "By Ticket Price",
      };
    case "highestPrice":
      return {
        identity,
        label: "Highest Ticket Price",
        headingSuffix: "By Ticket Price",
      };
    case "newest":
      return { identity, label: "Newest", headingSuffix: "By Newest" };
    case "mostTicketsLeft":
      return {
        identity,
        label: "Most Tickets Left",
        headingSuffix: "By Availability",
      };
  }
}
