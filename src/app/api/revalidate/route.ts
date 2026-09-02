import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const MAX_PATHS = 200;

export async function POST(request: NextRequest) {
  const key = process.env.INTERNAL_API_KEY;

  if (!key) {
    return NextResponse.json(
      { message: "Revalidation not configured" },
      { status: 500 },
    );
  }

  if (request.headers.get("x-internal-key") !== key) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    paths?: unknown;
  } | null;

  if (!body || !Array.isArray(body.paths)) {
    return NextResponse.json({ message: "Missing paths" }, { status: 400 });
  }

  const paths = Array.from(
    new Set(
      body.paths.filter(
        (path): path is string =>
          typeof path === "string" && path.startsWith("/"),
      ),
    ),
  ).slice(0, MAX_PATHS);

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {}
  }

  return NextResponse.json({ revalidated: paths.length });
}
