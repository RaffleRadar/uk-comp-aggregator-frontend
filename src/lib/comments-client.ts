import type { CommentNode } from "@/lib/api";

type ErrorPayload = {
  message?: string | string[];
};

async function parseError(response: Response): Promise<never> {
  try {
    const payload = (await response.json()) as ErrorPayload;

    if (Array.isArray(payload.message) && payload.message.length > 0) {
      throw new Error(payload.message[0]);
    }

    if (typeof payload.message === "string" && payload.message.length > 0) {
      throw new Error(payload.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }

  throw new Error(`HTTP ${response.status}`);
}

export async function postComment(input: {
  competitionId: string;
  body: string;
  parentId?: string;
}): Promise<CommentNode> {
  const response = await fetch("/api/comments", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return parseError(response);
  }

  return response.json() as Promise<CommentNode>;
}

export async function deleteComment(id: string): Promise<void> {
  const response = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return parseError(response);
  }
}
