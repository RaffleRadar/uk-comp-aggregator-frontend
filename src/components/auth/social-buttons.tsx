"use client";

import { Button } from "@/components/ui/button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

type Provider = "google" | "facebook";

function getProviderUrl(provider: Provider) {
  return `${apiUrl}/auth/${provider}`;
}

export function SocialButtons() {
  const showFacebook = true;

  function handleClick(provider: Provider) {
    if (!apiUrl) {
      return;
    }

    window.location.href = getProviderUrl(provider);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-rr-border" />
        <span className="text-xs uppercase tracking-[0.16em] text-rr-muted">
          or
        </span>
        <div className="h-px flex-1 bg-rr-border" />
      </div>

      <div className={showFacebook ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"}>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full justify-center"
          onClick={() => handleClick("google")}
          disabled={!apiUrl}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.8h5.35c-.55 3.2-3.35 4.6-5.35 4.6a6.5 6.5 0 1 1 0-13c1.75 0 3.2.7 4.2 1.65l1.9-1.9A9.2 9.2 0 0 0 12 2.8a9.2 9.2 0 1 0 0 18.4c5.3 0 9-3.7 9-9.1 0-.6-.07-1.05-.15-1.5Z"
            />
          </svg>
          Continue with Google
        </Button>

        {showFacebook ? (
          <Button
            type="button"
            variant="secondary"
            className="h-11 w-full justify-center"
            onClick={() => handleClick("facebook")}
            disabled={!apiUrl}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M13.5 22v-8h2.6l.4-3h-3V9.1c0-.9.3-1.6 1.7-1.6H16.6V4.8c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6V11H7v3h2.4v8h4.1Z"
              />
            </svg>
            Continue with Facebook
          </Button>
        ) : null}
      </div>
    </div>
  );
}
