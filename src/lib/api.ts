import type { Competition } from "@/types/competition";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const DEFAULT_REVALIDATE = 60;

type RequestOptions = {
  method?: string;
  body?: unknown;
  revalidate?: number | false;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, revalidate } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const isGet = method === "GET";
  const ttl = revalidate === undefined ? DEFAULT_REVALIDATE : revalidate;
  const cacheOptions =
    isGet && ttl !== false
      ? { next: { revalidate: ttl } }
      : { cache: "no-store" as const };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...cacheOptions,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}) as { message?: string });
    throw new Error(
      (error as { message?: string }).message ?? `HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

function toNum(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function getStats() {
  return apiFetch<{
    competitionsCount: number;
    operatorsCount: number;
    lastUpdatedAt: string | null;
  }>("/stats", { revalidate: 300 });
}

export type CompetitionSortField =
  | "prizeValue"
  | "endsAt"
  | "ticketPrice"
  | "ticketsSold"
  | "ticketsLeft"
  | "percentSold"
  | "totalTickets"
  | "valueRatio"
  | "bestValue"
  | "opportunityScore"
  | "createdAt";

export type GetCompetitionsParams = {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
  closing?: string;
  search?: string;
  operator?: string;
  minPrizeValue?: number;
  website?: string;
  freeOnly?: boolean;
  excludeInstant?: boolean;
  excludeFree?: boolean;
  excludeGames?: boolean;
};

export type CompetitionDetail = {
  id: string;
  slug: string | null;
  prize: string;
  imageUrl: string | null;
  ticketPrice: number | string | null;
  ticketsTotal: number | null;
  ticketsLeft?: number | null;
  ticketsSold?: number | null;
  percentSold: number | string | null;
  finalPercentSold?: number | string | null;
  endsAt: string | null;
  hasEnded: boolean;
  createdAt: string;
  isActive?: boolean;
  closedAt?: string | null;
  category: string | null;
  instantPrizes: boolean | null;
  availableToBuy: boolean | null;
  valueRatio: number | string | null;
  operator: {
    id: string | null;
    name: string;
    baseUrl: string;
    avgVr: number | null;
    vrSampleSize: number | null;
  } | null;
  prizeValue: number | string | null;
  prizeValueEstimated: boolean | null;
  cashAlternative: number | string | null;
  maxPerPerson: number | null;
  numWinners: number | null;
  prizeMake: string | null;
  prizeModel: string | null;
  description: string | null;
  sourceUrl: string | null;
  commentCount?: number;
};

export type CompetitionSearchResult = {
  id: string;
  slug: string | null;
  prize: string;
  imageUrl: string | null;
  ticketPrice: number | string | null;
  operator: {
    name: string;
  } | null;
};

export type OperatorSummary = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  avgVr: number | null;
  vrSampleSize: number | null;
  activeCompetitionsCount: number | null;
  ticketPriceFrom: number | null;
  ticketPriceAvg: number | null;
  highestPrizeValue: number | null;
  instantWinsAvailable: boolean;
};

export type OperatorDetail = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  avgVr: number | null;
  vrSampleSize: number | null;
  activeCompetitionsCount: number | null;
  ticketPriceFrom: number | null;
  ticketPriceAvg: number | null;
  highestPrizeValue: number | null;
  instantWinsAvailable: boolean;
  baseUrl: string | null;
  competitions: CompetitionDetail[];
};

function normalizeEmbeddedOperator(
  value: unknown,
): CompetitionDetail["operator"] {
  if (!value || typeof value !== "object") return null;

  const data = value as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name : null;

  if (!name) return null;

  return {
    id: typeof data.id === "string" ? data.id : null,
    name,
    baseUrl:
      typeof data.baseUrl === "string"
        ? data.baseUrl
        : typeof data.base_url === "string"
          ? data.base_url
          : "",
    avgVr: toNum(data.avgVr ?? data.avg_vr),
    vrSampleSize: toNum(
      data.sampleSize ?? data.vrSampleSize ?? data.vr_sample_size,
    ),
  };
}

function normalizeCompetitionItem<T>(item: T): T {
  if (!item || typeof item !== "object") return item;

  const data = item as Record<string, unknown>;

  if (!("operator" in data)) return item;

  return {
    ...data,
    slug: typeof data.slug === "string" ? data.slug : null,
    availableToBuy:
      typeof data.availableToBuy === "boolean"
        ? data.availableToBuy
        : typeof data.available_to_buy === "boolean"
          ? data.available_to_buy
          : null,
    operator: normalizeEmbeddedOperator(data.operator),
  } as T;
}

function normalizeCompetitionsResponse<T>(value: unknown): T[] {
  let list: unknown[] = [];

  if (Array.isArray(value)) {
    list = value;
  } else if (value && typeof value === "object") {
    const data = value as {
      items?: unknown;
      data?: unknown;
      competitions?: unknown;
    };

    if (Array.isArray(data.items)) list = data.items;
    else if (Array.isArray(data.data)) list = data.data;
    else if (Array.isArray(data.competitions)) list = data.competitions;
  }

  return list.map((item) => normalizeCompetitionItem(item as T));
}

function normalizeCompetitionSearchResponse(
  value: unknown,
): CompetitionSearchResult[] {
  return normalizeCompetitionsResponse<Record<string, unknown>>(value).flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const data = item as {
      id?: string | number;
      slug?: string | null;
      prize?: string;
      imageUrl?: string | null;
      image_url?: string | null;
      ticketPrice?: number | string | null;
      ticket_price?: number | string | null;
      operator?: { name?: string } | null;
    };

    if (data.id === undefined || typeof data.prize !== "string") return [];

    return [
      {
        id: String(data.id),
        slug: typeof data.slug === "string" ? data.slug : null,
        prize: data.prize,
        imageUrl: data.imageUrl ?? data.image_url ?? null,
        ticketPrice: data.ticketPrice ?? data.ticket_price ?? null,
        operator:
          data.operator && typeof data.operator.name === "string"
            ? { name: data.operator.name }
            : null,
      },
    ];
  });
}

function normalizeOperatorSummary(value: unknown): OperatorSummary[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const data = item as Record<string, unknown>;
    const id = typeof data.id === "string" ? data.id : null;
    const slug = typeof data.slug === "string" ? data.slug : null;
    const name = typeof data.name === "string" ? data.name : null;

    if (!id || !slug || !name) return [];

    return [
      {
        id,
        slug,
        name,
        logoUrl:
          typeof data.logo === "string"
            ? data.logo
            : typeof data.logoUrl === "string"
              ? data.logoUrl
              : null,
        avgVr: toNum(data.avgVr ?? data.avg_vr),
        vrSampleSize: toNum(
          data.sampleSize ?? data.vrSampleSize ?? data.vr_sample_size,
        ),
        activeCompetitionsCount: toNum(
          data.activeCompetitionsCount ?? data.active_competitions_count,
        ),
        ticketPriceFrom: toNum(data.ticketPriceFrom),
        ticketPriceAvg: toNum(data.ticketPriceAvg),
        highestPrizeValue: toNum(data.highestPrizeValue),
        instantWinsAvailable: data.instantWinsAvailable === true,
      },
    ];
  });
}

function normalizeOperatorDetail(value: unknown): OperatorDetail | null {
  if (!value || typeof value !== "object") return null;

  const data = value as Record<string, unknown>;
  const id = typeof data.id === "string" ? data.id : null;
  const slug = typeof data.slug === "string" ? data.slug : null;
  const name = typeof data.name === "string" ? data.name : null;

  if (!id || !slug || !name) return null;

  return {
    id,
    slug,
    name,
    logoUrl:
      typeof data.logo === "string"
        ? data.logo
        : typeof data.logoUrl === "string"
          ? data.logoUrl
          : null,
    avgVr: toNum(data.avgVr ?? data.avg_vr),
    vrSampleSize: toNum(
      data.sampleSize ?? data.vrSampleSize ?? data.vr_sample_size,
    ),
    activeCompetitionsCount: toNum(
      data.activeCompetitionsCount ?? data.active_competitions_count,
    ),
    ticketPriceFrom: toNum(data.ticketPriceFrom),
    ticketPriceAvg: toNum(data.ticketPriceAvg),
    highestPrizeValue: toNum(data.highestPrizeValue),
    instantWinsAvailable: data.instantWinsAvailable === true,
    baseUrl:
      typeof data.baseUrl === "string"
        ? data.baseUrl
        : typeof data.base_url === "string"
          ? data.base_url
          : null,
    competitions: normalizeCompetitionsResponse<CompetitionDetail>(
      data.competitions,
    ),
  };
}

export async function getCompetitions(
  params?: GetCompetitionsParams,
): Promise<Competition[]> {
  const query = new URLSearchParams();

  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.page) query.set("page", String(params.page));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params?.category) query.set("category", params.category);
  if (params?.closing) query.set("closing", params.closing);
  if (params?.search) query.set("search", params.search);
  if (params?.operator) query.set("operator", params.operator);
  if (params?.minPrizeValue)
    query.set("minPrizeValue", String(params.minPrizeValue));
  if (params?.website) query.set("website", params.website);
  if (params?.freeOnly) query.set("freeOnly", "true");
  if (params?.excludeInstant) query.set("excludeInstant", "true");
  if (params?.excludeFree) query.set("excludeFree", "true");
  if (params?.excludeGames) query.set("excludeGames", "true");

  const path =
    query.size > 0 ? `/competitions?${query.toString()}` : "/competitions";
  const response = await apiFetch<unknown>(path);
  return normalizeCompetitionsResponse<Competition>(response);
}

export async function getCompetitionSearch(
  q: string,
  limit = 8,
  excludeGames = false,
) {
  const query = new URLSearchParams({
    q,
    limit: String(limit),
  });

  if (excludeGames) query.set("excludeGames", "true");

  const response = await apiFetch<unknown>(
    `/competitions/search?${query.toString()}`,
    { revalidate: false },
  );
  return normalizeCompetitionSearchResponse(response);
}

export async function getOperators() {
  const response = await apiFetch<unknown>("/operators");
  return normalizeOperatorSummary(response);
}

export async function getOperator(slug: string) {
  const response = await apiFetch<unknown>(`/operators/${slug}`);
  return normalizeOperatorDetail(response);
}

type GetTopOpportunitiesParams = {
  limit?: number;
  excludeInstant?: boolean;
  excludeFree?: boolean;
  excludeGames?: boolean;
  category?: string;
  closing?: string;
  freeOnly?: boolean;
  operator?: string;
  minPrizeValue?: number;
};

type GetMostUndersoldParams = {
  limit?: number;
  excludeInstant?: boolean;
  excludeFree?: boolean;
  excludeGames?: boolean;
  category?: string;
  closing?: string;
  freeOnly?: boolean;
  operator?: string;
  minPrizeValue?: number;
};

export async function getTopOpportunities(
  params?: GetTopOpportunitiesParams,
): Promise<Competition[]> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.excludeInstant) query.set("excludeInstant", "true");
  if (params?.excludeFree) query.set("excludeFree", "true");
  if (params?.excludeGames) query.set("excludeGames", "true");
  if (params?.category) query.set("category", params.category);
  if (params?.closing) query.set("closing", params.closing);
  if (params?.freeOnly) query.set("freeOnly", "true");
  if (params?.operator) query.set("operator", params.operator);
  if (params?.minPrizeValue)
    query.set("minPrizeValue", String(params.minPrizeValue));

  const path =
    query.size > 0
      ? `/competitions/top-opportunities?${query.toString()}`
      : "/competitions/top-opportunities";

  const response = await apiFetch<unknown>(path);
  return normalizeCompetitionsResponse<Competition>(response);
}

export async function getMostUndersold(
  params?: GetMostUndersoldParams,
): Promise<Competition[]> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.excludeInstant) query.set("excludeInstant", "true");
  if (params?.excludeFree) query.set("excludeFree", "true");
  if (params?.excludeGames) query.set("excludeGames", "true");
  if (params?.category) query.set("category", params.category);
  if (params?.closing) query.set("closing", params.closing);
  if (params?.freeOnly) query.set("freeOnly", "true");
  if (params?.operator) query.set("operator", params.operator);
  if (params?.minPrizeValue)
    query.set("minPrizeValue", String(params.minPrizeValue));

  const path =
    query.size > 0
      ? `/competitions/most-undersold?${query.toString()}`
      : "/competitions/most-undersold";

  const response = await apiFetch<unknown>(path);
  return normalizeCompetitionsResponse<Competition>(response);
}

export async function getRecentlyEnded(limit = 8): Promise<Competition[]> {
  const query = new URLSearchParams({
    limit: String(limit),
  });
  const response = await apiFetch<unknown>(
    `/competitions/recently-ended?${query.toString()}`,
  );
  return normalizeCompetitionsResponse<Competition>(response);
}

export async function getCompetition(id: string) {
  const response = await apiFetch<CompetitionDetail>(`/competitions/${id}`);
  return normalizeCompetitionItem(response);
}

export async function getCompetitionHistory(id: string) {
  return apiFetch<unknown>(`/competitions/${id}/history`);
}

export async function getSimilarCompetitions(id: string, limit = 8) {
  return apiFetch<unknown>(`/competitions/${id}/similar?limit=${limit}`);
}

export async function subscribeToNewsletter(email: string) {
  return apiFetch<unknown>("/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}

export async function confirmNewsletterSubscription(token: string) {
  return apiFetch<unknown>("/newsletter/confirm", {
    method: "POST",
    body: { token },
  });
}

export type OutboundClickSource = "detail" | "operator_profile";

export async function trackCompetitionClick(
  id: string,
  source?: OutboundClickSource,
) {
  return fetch(`/api/competitions/${encodeURIComponent(id)}/click`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source }),
    credentials: "same-origin",
  }).catch(() => {});
}

export async function trackOperatorClick(
  operatorId: string,
  source?: OutboundClickSource,
) {
  return fetch(`/api/operators/${encodeURIComponent(operatorId)}/click`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source }),
    credentials: "same-origin",
  }).catch(() => {});
}

export async function unsubscribeFromNewsletter(token: string) {
  return apiFetch<unknown>("/newsletter/unsubscribe", {
    method: "POST",
    body: { token },
  });
}

export type CompetitionSitemapEntry = {
  slug: string;
  updatedAt: string | null;
  endsAt: string | null;
};

export async function getCompetitionSitemapEntries(): Promise<
  CompetitionSitemapEntry[]
> {
  try {
    const response = await apiFetch<unknown>("/competitions/sitemap", {
      revalidate: 3600,
    });
    if (!Array.isArray(response)) return [];
    return response.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const data = row as Record<string, unknown>;
      const slug = typeof data.slug === "string" ? data.slug : null;
      if (!slug) return [];
      const updatedAt =
        typeof data.updatedAt === "string" ? data.updatedAt : null;
      const endsAt = typeof data.endsAt === "string" ? data.endsAt : null;
      return [{ slug, updatedAt, endsAt }];
    });
  } catch {
    return [];
  }
}

export type CommentAuthor = { id: string; displayName: string; isStaff: boolean };

export type CommentNode = {
  id: string;
  body: string | null;
  createdAt: string;
  isDeleted: boolean;
  author: CommentAuthor | null;
  replies: CommentNode[];
};

export async function getComments(competitionId: string) {
  return apiFetch<CommentNode[]>(
    `/comments?competitionId=${encodeURIComponent(competitionId)}`,
    { revalidate: false },
  );
}
