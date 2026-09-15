"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/contexts/auth-context";
import { authRequest } from "@/lib/auth-client";
import { takeOauthTarget } from "@/lib/auth-redirect";

const cardClass =
  "rounded-[24px] bg-rr-surface px-5 py-5 shadow-sm sm:px-7 sm:py-6";

type Status = "loading" | "failed";

function LoadingState() {
  return (
    <div className={cardClass}>
      <h1 className="text-xl font-medium tracking-[-0.03em] text-rr-primary">
        Signing you in...
      </h1>
      <p className="mt-2 text-sm leading-6 text-rr-secondary">
        Please wait while we complete your sign-in.
      </p>
    </div>
  );
}

function FailureState() {
  return (
    <div className={cardClass}>
      <h1 className="text-xl font-medium tracking-[-0.03em] text-rr-primary">
        Sign-in failed
      </h1>
      <p className="mt-2 text-sm leading-6 text-rr-secondary">
        We could not sign you in. Please try again.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-flex text-sm font-medium text-rr-green no-underline transition-opacity hover:opacity-80"
      >
        Back to login
      </Link>
    </div>
  );
}

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshMe } = useAuth();
  const hasStartedRef = useRef(false);
  const [status, setStatus] = useState<Status>("loading");
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      return;
    }

    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    async function exchange() {
      try {
        await authRequest("/oauth-exchange", {
          method: "POST",
          body: { code },
        });
        await refreshMe();
        router.replace(takeOauthTarget());
      } catch {
        setStatus("failed");
      }
    }

    void exchange();
  }, [code, refreshMe, router]);

  if (!code || status === "failed") {
    return <FailureState />;
  }

  return <LoadingState />;
}

export default function OAuthCallbackPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Suspense fallback={<LoadingState />}>
          <OAuthCallbackContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
