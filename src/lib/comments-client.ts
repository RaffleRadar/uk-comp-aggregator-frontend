import { ensureRefreshed } from "@/lib/auth-client";
import type { CommentNode } from "@/lib/api";

type PostCommentInput = {
  competitionId: string;
  body: string;
  parentId?: string;
};

type ErrorPayload = {
  message?: string | string[];
};

async function toError(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return new Error(`Request failed with status ${response.status}`);
  }

  try {
    const parsed = JSON.parse(raw) as ErrorPayload;
    const message = Array.isArray(parsed.message)
      ? parsed.message[0]
      : parsed.message;

    return new Error(message || `Request failed with status ${response.status}`);
  } catch {
    return new Error(raw);
  }
}

async function requestWithRetry(
  path: string,
  init: RequestInit,
  hasRetried = false,
): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
  });

  if (response.status === 401 && !hasRetried) {
    const refreshed = await ensureRefreshed();

    if (refreshed) {
      return requestWithRetry(path, init, true);
    }

    throw new Error("Your session has expired. Please sign in again.");
  }

  return response;
}

export async function postComment(
  input: PostCommentInput,
): Promise<CommentNode> {
  const response = await requestWithRetry("/api/comments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await toError(response);
  }

  return (await response.json()) as CommentNode;
}

export async function deleteComment(id: string): Promise<void> {
  const response = await requestWithRetry(
    `/api/comments/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw await toError(response);
  }
}
