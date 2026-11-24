import type { PrizePageContent, PrizePageFaq } from "@/sanity/prize-pages";
import {
  findDraw,
  formatCount,
  formatOdds,
  formatTicketPrice,
  historyPeriodLabel,
  prizePageDescription,
  type PrizePage,
} from "@/lib/prizes";

export type PrizeFigures = Record<string, string>;

export function buildPrizeFigures(page: PrizePage): PrizeFigures {
  const cheapest = page.summary.cheapestEntry;
  const cheapestDraw = findDraw(page, cheapest?.drawId);
  const best = page.summary.bestOdds;
  const bestDraw = findDraw(page, best?.drawId);

  return {
    prize: page.prize.label,
    liveDraws: formatCount(page.prize.liveDraws),
    operators: formatCount(page.prize.operators),
    cheapestEntry: cheapest ? formatTicketPrice(cheapest.ticketPrice) : "",
    cheapestOperator: cheapestDraw?.operator.name ?? "",
    bestOdds: best ? formatOdds(best.liveOdds) : "",
    bestOddsOperator: bestDraw?.operator.name ?? "",
  };
}

export function fillPrizeText(
  text: string | null | undefined,
  figures: PrizeFigures,
): string {
  if (!text) return "";

  let unavailable = false;
  const filled = text.replace(/\{(\w+)\}/g, (match, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(figures, name)) return match;
    if (!figures[name]) unavailable = true;
    return figures[name];
  });

  return unavailable ? "" : filled.trim();
}

export function defaultPrizeTitle(page: PrizePage): string {
  return `${page.prize.label} Competitions UK | RaffleRadar`;
}

function plural(count: number, one: string, many: string): string {
  return `${formatCount(count)} ${count === 1 ? one : many}`;
}

export function defaultPrizeFaqs(page: PrizePage): PrizePageFaq[] {
  const label = page.prize.label;
  const { liveDraws, operators } = page.prize;
  const faqs: PrizePageFaq[] = [];
  const history = page.history;

  if (liveDraws > 0) {
    faqs.push({
      key: "live",
      question: `How many ${label} competitions are running right now?`,
      answer: `${plural(liveDraws, "live draw", "live draws")} from ${plural(operators, "approved operator", "approved operators")}. The list refreshes through the day, so closed draws drop off automatically.`,
    });
  } else {
    const period = historyPeriodLabel(history.days);
    faqs.push({
      key: "live",
      question: `Is anyone running a ${label} competition right now?`,
      answer:
        history.timesRun > 0
          ? `Not right now. It ran ${plural(history.timesRun, "time", "times")} across ${plural(history.uniqueOperators, "operator", "operators")} in the last ${period}. It comes back on this page as soon as an approved operator lists it again.`
          : `Not right now. It comes back on this page as soon as an approved operator lists it again.`,
    });
  }

  const cheapest = page.summary.cheapestEntry;
  const cheapestDraw = findDraw(page, cheapest?.drawId);
  if (cheapest && cheapestDraw) {
    faqs.push({
      key: "cheapest",
      question: `What is the cheapest way to enter?`,
      answer: `The lowest entry price right now is ${formatTicketPrice(cheapest.ticketPrice)} at ${cheapestDraw.operator.name}. Check the ticket cap as well: a cheap entry in a big draw can still give long odds.`,
    });
  }

  const best = page.summary.bestOdds;
  const bestDraw = findDraw(page, best?.drawId);
  if (best && bestDraw) {
    faqs.push({
      key: "odds",
      question: `Which ${label} draw has the best odds?`,
      answer: `${bestDraw.operator.name} has the best live odds right now at ${formatOdds(best.liveOdds)} per ticket. Odds lengthen as more tickets sell, so the If Sold Out figure shows the longest they can get.`,
    });
  }

  faqs.push({
    key: "method",
    question: "How are the odds worked out?",
    answer:
      "Live Odds use the tickets sold so far. If Sold Out uses the full ticket cap. Forecasted uses how many tickets the draw is expected to sell by the time it closes, based on how similar past draws finished and how fast this one is selling. All three assume one ticket and one winner.",
  });

  return faqs;
}

export type ResolvedPrizeSeo = {
  title: string;
  description: string;
  intro: string;
  faqs: PrizePageFaq[];
};

export function resolvePrizeSeo(
  page: PrizePage,
  content: PrizePageContent | null,
): ResolvedPrizeSeo {
  const figures = buildPrizeFigures(page);
  const fill = (value: string | null | undefined) =>
    fillPrizeText(value, figures);

  const description =
    fill(content?.seoDescription) || prizePageDescription(page);
  const custom = (content?.faqs ?? [])
    .map((faq) => ({
      key: faq.key,
      question: fill(faq.question),
      answer: fill(faq.answer),
    }))
    .filter((faq) => faq.question && faq.answer);

  return {
    title: fill(content?.seoTitle) || defaultPrizeTitle(page),
    description,
    intro: fill(content?.intro) || description,
    faqs: custom.length > 0 ? custom : defaultPrizeFaqs(page),
  };
}
