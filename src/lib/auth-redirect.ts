export const OAUTH_NEXT_COOKIE_NAME = "rr_oauth_next";

const OAUTH_NEXT_MAX_AGE = 600;

export function getSafeRedirectTarget(value: string | null | undefined) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}

export function rememberOauthTarget(value: string | null | undefined) {
  if (typeof document === "undefined") {
    return;
  }

  const target = getSafeRedirectTarget(value);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${OAUTH_NEXT_COOKIE_NAME}=${encodeURIComponent(target)}; Max-Age=${OAUTH_NEXT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

export function takeOauthTarget() {
  if (typeof document === "undefined") {
    return "/";
  }

  const entry = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${OAUTH_NEXT_COOKIE_NAME}=`));

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${OAUTH_NEXT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;

  if (!entry) {
    return "/";
  }

  const raw = entry.slice(OAUTH_NEXT_COOKIE_NAME.length + 1);

  try {
    return getSafeRedirectTarget(decodeURIComponent(raw));
  } catch {
    return "/";
  }
}
