import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAccessCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createUnauthorizedResponse,
  readBackendResponseBody,
} from "@/lib/backend-auth";

type RefreshResponse = {
  accessToken: string;
  refreshToken: string | null;
};

function createUnavailableResponse() {
  return NextResponse.json({ message: "Refresh unavailable" }, { status: 503 });
}

async function requestBackendRefresh(
  request: NextRequest,
  refreshToken: string,
) {
  try {
    return await backendAuthFetch("/auth/refresh", {
      method: "POST",
      requestHeaders: request.headers,
      authorizationToken: refreshToken,
    });
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    await clearAuthCookies();
    return createUnauthorizedResponse();
  }

  const response = await requestBackendRefresh(request, refreshToken);

  if (!response) {
    return createUnavailableResponse();
  }

  if (response.status === 401) {
    await clearAuthCookies();
    return createUnauthorizedResponse();
  }

  if (!response.ok) {
    return createUnavailableResponse();
  }

  const data = await readBackendResponseBody<RefreshResponse>(response);

  if (!data?.accessToken) {
    return createUnavailableResponse();
  }

  if (data.refreshToken) {
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } else {
    await setAccessCookies(data.accessToken);
  }

  return NextResponse.json({ ok: true });
}
