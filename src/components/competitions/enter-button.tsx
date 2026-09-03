"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { trackCompetitionClick } from "@/lib/api";
import { pushEvent } from "@/lib/analytics";
import { getAnonIdForTracking } from "@/lib/anon-id";

type Props = {
  competitionId: string;
  sourceUrl: string | null;
  operatorName: string;
  operatorUrl?: string | null;
  hasEnded?: boolean;
};

export function EnterButton({
  competitionId,
  sourceUrl,
  operatorName,
  operatorUrl,
  hasEnded = false,
}: Props) {
  const href = hasEnded ? operatorUrl ?? sourceUrl : sourceUrl;

  const handleClick = () => {
    getAnonIdForTracking();
    pushEvent("outbound_click", {
      operator: operatorName,
      source: hasEnded ? "detail-ended" : "detail",
      competition: competitionId,
    });
    void trackCompetitionClick(competitionId, "detail").catch(() => undefined);
  };

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex-1 bg-rr-green text-rr-on-accent font-semibold uppercase tracking-wide text-sm rounded-lg py-3 px-4 text-center hover:opacity-90 transition-opacity flex items-center justify-center"
    >
      {hasEnded ? `Visit ${operatorName}` : `Enter on ${operatorName}`}
      <IconExternalLink size={16} className="ml-2" />
    </a>
  );
}
