export type CompetitionSortState = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  excludeInstant?: boolean;
  excludeFree?: boolean;
};

export type CompetitionSortIdentity =
  | "bestValue"
  | "topOpportunities"
  | "mostUndersold"
  | "bestOdds"
  | "sellingFast"
  | "topPrizes"
  | "endingSoon"
  | "mostTicketsLeft"
  | "lowestPrice"
  | "latest";

export function getCompetitionSortIdentity(
  state: CompetitionSortState,
): CompetitionSortIdentity | null {
  const { sortBy, sortOrder, excludeInstant = false, excludeFree = false } = state;

  if ((sortBy === "bestValue" || sortBy === "valueRatio") && sortOrder === "desc") {
    return "bestValue";
  }

  if (sortBy === "opportunityScore" && sortOrder === "desc") {
    return "topOpportunities";
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

  if (sortBy === "createdAt" && sortOrder === "desc") {
    return "latest";
  }

  return null;
}

export function getCompetitionSortPresentation(state: CompetitionSortState) {
  const identity = getCompetitionSortIdentity(state);

  if (!identity) {
    return null;
  }

  switch (identity) {
    case "bestValue":
      return { identity, label: "Best value", headingSuffix: "By Value" };
    case "topOpportunities":
      return {
        identity,
        label: "Top opportunities",
        headingSuffix: "By Opportunity",
      };
    case "mostUndersold":
      return {
        identity,
        label: "Most Undersold",
        headingSuffix: "By Most Undersold",
      };
    case "bestOdds":
      return { identity, label: "Best odds", headingSuffix: "By Best Odds" };
    case "sellingFast":
      return { identity, label: "Selling fast", headingSuffix: "By Selling Fast" };
    case "topPrizes":
      return { identity, label: "Top prizes", headingSuffix: "By Prize Value" };
    case "endingSoon":
      return { identity, label: "Ending soon", headingSuffix: "By Ending Soon" };
    case "mostTicketsLeft":
      return {
        identity,
        label: "Most tickets left",
        headingSuffix: "By Availability",
      };
    case "lowestPrice":
      return { identity, label: "Lowest price", headingSuffix: "By Price" };
    case "latest":
      return { identity, label: "Latest", headingSuffix: "By Newest" };
  }
}
