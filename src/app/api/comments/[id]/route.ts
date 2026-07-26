import { NextRequest } from "next/server";
import { readAccessToken } from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createProxyResponse,
  createUnauthorizedResponse,
} from "@/lib/backend-auth";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  const { id } = await context.params;
  const response = await backendAuthFetch(`/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
    requestHeaders: request.headers,
    attachAccessToken: true,
    accessToken,
  });

  return createProxyResponse(response);
}
