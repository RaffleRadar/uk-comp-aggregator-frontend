import { NextRequest, NextResponse } from "next/server";
import { backendAuthFetch, readBackendResponseBody } from "@/lib/backend-auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const body = (await request.json().catch(() => ({}))) as {
    reason?: string;
    comment?: string;
  };

  try {
    const response = await backendAuthFetch(
      `/competitions/${encodeURIComponent(id)}/report`,
      {
        method: "POST",
        body: {
          reason: body.reason,
          comment: body.comment ?? null,
        },
        requestHeaders: request.headers,
        attachAccessToken: false,
        accessToken: undefined,
      },
    );

    const parsed = await readBackendResponseBody(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            typeof parsed === "object" &&
            parsed !== null &&
            "message" in parsed &&
            typeof parsed.message === "string"
              ? parsed.message
              : "Failed to submit report",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Failed to submit report",
      },
      { status: 500 },
    );
  }
}
