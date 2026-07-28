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

let refreshPromise: Promise<boolean> | null = null;

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
    path !== "/refresh"
  ) {
    const refreshed = await ensureRefreshed();

    if (refreshed) {
      return request(path, options, retryOnUnauthorized, true);
    }

    throw new AuthClientError("Signed out", 401);
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

export function ensureRefreshed() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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
