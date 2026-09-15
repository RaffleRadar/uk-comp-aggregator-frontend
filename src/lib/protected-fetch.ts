import {
  ensureRefreshed,
  getAccessTokenExpiry,
  hasSessionHint,
} from "@/lib/auth-client";

const REFRESH_MARGIN_MS = 30 * 1000;

async function ensureFreshAccessToken() {
  if (!hasSessionHint()) {
    return;
  }

  const expiresAt = getAccessTokenExpiry();

  if (expiresAt === null) {
    return;
  }

  if (Date.now() < expiresAt - REFRESH_MARGIN_MS) {
    return;
  }

  await ensureRefreshed();
}

export async function protectedFetch(path: string, init: RequestInit = {}) {
  await ensureFreshAccessToken();

  const options: RequestInit = {
    ...init,
    credentials: "same-origin",
  };

  const response = await fetch(path, options);

  if (response.status !== 401 || !hasSessionHint()) {
    return response;
  }

  const refreshed = await ensureRefreshed();

  if (!refreshed) {
    return response;
  }

  return fetch(path, options);
}
