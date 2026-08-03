import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container py-10 md:py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-rr-border bg-rr-surface p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-rr-primary md:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-rr-secondary md:text-base">
          The page you’re looking for doesn’t exist or is no longer available.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-rr-green px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/competitions"
            className="inline-flex items-center justify-center rounded-xl border border-rr-border bg-rr-elevated px-4 py-2 text-sm font-medium text-rr-primary transition hover:bg-rr-surface"
          >
            Browse competitions
          </Link>
        </div>
      </div>
    </main>
  );
}
