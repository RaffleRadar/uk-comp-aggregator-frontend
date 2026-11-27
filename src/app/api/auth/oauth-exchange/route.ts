import { NextRequest, NextResponse } from "next/server";
import { readAnonId, setAuthCookies } from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createProxyResponse,
  readBackendResponseBody,
} from "@/lib/backend-auth";

type OauthExchangeResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { code?: string };
  const anonId = await readAnonId();

  const response = await backendAuthFetch("/auth/oauth/exchange", {
    method: "POST",
    body: anonId ? { code: body.code, anonId } : { code: body.code },
    requestHeaders: request.headers,
  });

  if (!response.ok) {
    return createProxyResponse(response);
  }

  const data = await readBackendResponseBody<OauthExchangeResponse>(response);

  if (!data?.accessToken || !data?.refreshToken) {
    return NextResponse.json({ message: "Invalid auth response" }, { status: 502 });
  }

  await setAuthCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return NextResponse.json({ ok: true, isNewUser: data.isNewUser === true });
}
