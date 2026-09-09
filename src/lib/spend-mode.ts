export const SPEND_COOKIE = "rr_spend";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function parseSpend(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function readSpendCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SPEND_COOKIE}=([^;]*)`),
  );
  return parseSpend(match ? decodeURIComponent(match[1]) : null);
}

export function writeSpendCookie(amount: number | null): void {
  if (typeof document === "undefined") return;
  document.cookie = amount
    ? `${SPEND_COOKIE}=${amount}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`
    : `${SPEND_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function withSpend(href: string, amount: number | null): string {
  if (!amount) return href;
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  if (!params.has("spend")) params.set("spend", String(amount));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
