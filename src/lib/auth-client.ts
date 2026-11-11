export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  hasPassword: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string | Date;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  displayName?: string;
};

type AuthRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type ErrorResponse = {
  message?: string;
};

export class AuthClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthClientError";
    this.status = status;
  }
}

export type RefreshOutcome = "refreshed" | "signed-out" | "unavailable";

let refreshPromise: Promise<RefreshOutcome> | null = null;

const SESSION_HINT_COOKIE_NAME = "rr_session";
const REFRESH_LOCK_NAME = "rr-auth-refresh";
const REFRESH_TIMEOUT_MS = 10 * 1000;
const FRESH_ACCESS_MARGIN_MS = 30 * 1000;

function readSessionHint() {
  if (typeof document === "undefined") {
    return null;
  }

  const entry = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_HINT_COOKIE_NAME}=`));

  if (!entry) {
    return null;
  }

  return entry.slice(SESSION_HINT_COOKIE_NAME.length + 1);
}

export function hasSessionHint() {
  return readSessionHint() !== null;
}

export function getAccessTokenExpiry() {
  const value = readSessionHint();

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

function buildBody(body: unknown) {
  return body === undefined ? undefined : JSON.stringify(body);
}

function buildHeaders(headers: HeadersInit | undefined, hasBody: boolean) {
  const nextHeaders = new Headers(headers);

  if (hasBody && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
}

async function toAuthError(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return new AuthClientError(`HTTP ${response.status}`, response.status);
  }

  try {
    const parsed = JSON.parse(raw) as ErrorResponse;
    return new AuthClientError(
      parsed.message ?? `HTTP ${response.status}`,
      response.status,
    );
  } catch {
    return new AuthClientError(raw, response.status);
  }
}

async function request(
  path: string,
  options: AuthRequestOptions = {},
  retryOnUnauthorized: boolean,
  hasRetried = false,
): Promise<Response> {
  const { body, headers, method = "GET", ...rest } = options;

  const response = await fetch(`/api/auth${path}`, {
    ...rest,
    method,
    headers: buildHeaders(headers, body !== undefined),
    body: buildBody(body),
    credentials: "same-origin",
  });

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    !hasRetried &&
    path !== "/refresh" &&
    hasSessionHint()
  ) {
    const outcome = await refreshSession();

    if (outcome === "refreshed") {
      return request(path, options, retryOnUnauthorized, true);
    }

    if (outcome === "signed-out") {
      throw new AuthClientError("Signed out", 401);
    }

    throw new AuthClientError("Service unavailable", 503);
  }

  if (!response.ok) {
    throw await toAuthError(response);
  }

  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

async function requestRefresh(): Promise<RefreshOutcome> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REFRESH_TIMEOUT_MS,
  );

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      signal: controller.signal,
    });

    if (response.ok) {
      return "refreshed";
    }

    return response.status === 401 ? "signed-out" : "unavailable";
  } catch {
    return "unavailable";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function wasRefreshedElsewhere(expiryBefore: number | null) {
  const expiry = getAccessTokenExpiry();

  return (
    expiry !== null &&
    expiry !== expiryBefore &&
    expiry - Date.now() > FRESH_ACCESS_MARGIN_MS
  );
}

async function refreshUnderLock(): Promise<RefreshOutcome> {
  const expiryBefore = getAccessTokenExpiry();

  const run = async (): Promise<RefreshOutcome> => {
    if (!hasSessionHint()) {
      return "signed-out";
    }

    if (wasRefreshedElsewhere(expiryBefore)) {
      return "refreshed";
    }

    return requestRefresh();
  };

  if (typeof navigator === "undefined" || !navigator.locks) {
    return run();
  }

  const outcome = await navigator.locks.request(REFRESH_LOCK_NAME, run);

  return outcome;
}

export function refreshSession(): Promise<RefreshOutcome> {
  if (!hasSessionHint()) {
    return Promise.resolve("signed-out");
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshUnderLock()
    .catch((): RefreshOutcome => "unavailable")
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function ensureRefreshed() {
  const outcome = await refreshSession();

  return outcome === "refreshed";
}

export function authFetch(path: string, options: AuthRequestOptions = {}) {
  return request(path, options, true);
}

export async function authFetchJson<T>(
  path: string,
  options: AuthRequestOptions = {},
): Promise<T> {
  const response = await authFetch(path, options);
  return readJson<T>(response);
}

export function authRequest(path: string, options: AuthRequestOptions = {}) {
  return request(path, options, false);
}

export async function authRequestJson<T>(
  path: string,
  options: AuthRequestOptions = {},
): Promise<T> {
  const response = await authRequest(path, options);
  return readJson<T>(response);
}
