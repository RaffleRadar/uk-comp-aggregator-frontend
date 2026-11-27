"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthClientError, authRequest, authFetchJson } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/lib/auth-client";

type VerifyEmailFormProps = {
  token: string | null;
};

type Status = "loading" | "idle" | "submitting" | "success" | "invalid" | "already-verified";

const cardClass =
  "rounded-[24px] bg-rr-surface px-5 py-5 shadow-sm sm:px-7 sm:py-6";

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkStatus() {
      try {
        const user = await authFetchJson<AuthUser>("/me");
        if (user.emailVerified) {
          setStatus("already-verified");
        } else if (!token) {
          setStatus("invalid");
        } else {
          setStatus("idle");
        }
      } catch {
        if (!token) {
          setStatus("invalid");
        } else {
          setStatus("idle");
        }
      }
    }
    checkStatus();
  }, [token]);

  async function handleVerify() {
    if (!token) {
      setStatus("invalid");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      await authRequest("/verify-email", {
        method: "POST",
        body: { token },
      });
      setStatus("success");
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (err) {
      if (
        err instanceof AuthClientError &&
        (err.status === 400 || err.status === 401 || err.status === 404)
      ) {
        setStatus("invalid");
      } else if (err instanceof AuthClientError && err.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
        setStatus("idle");
      } else {
        setError("We could not verify your email right now. Please try again.");
        setStatus("idle");
      }
    }
  }

  if (status === "loading") {
    return (
      <div className={cn(cardClass, "space-y-4")}>
        <div className="h-6 w-48 animate-pulse rounded bg-rr-elevated" />
        <div className="h-4 w-full animate-pulse rounded bg-rr-elevated" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={cn(cardClass, "space-y-4")}>
        <h2 className="text-xl font-medium tracking-[-0.03em] text-rr-primary">
          Email verified
        </h2>
        <p className="text-sm leading-6 text-rr-secondary">
          Your email has been verified. Redirecting you to the home page...
        </p>
        <Button type="button" disabled className="w-full">
          Redirecting...
        </Button>
      </div>
    );
  }

  if (status === "already-verified") {
    return (
      <div className={cn(cardClass, "space-y-4")}>
        <h2 className="text-xl font-medium tracking-[-0.03em] text-rr-primary">
          Email already verified
        </h2>
        <p className="text-sm leading-6 text-rr-secondary">
          Your email address has already been verified.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/")}
        >
          Go to home
        </Button>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className={cn(cardClass, "space-y-4")}>
        <h2 className="text-xl font-medium tracking-[-0.03em] text-rr-primary">
          Invalid or expired link
        </h2>
        <p className="text-sm leading-6 text-rr-secondary">
          This verification link is invalid or has expired. Please request a new
          verification email from your account settings.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/")}
        >
          Go to home
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(cardClass, "space-y-4")}>
      <h2 className="text-xl font-medium tracking-[-0.03em] text-rr-primary">
        Verify your email
      </h2>
      <p className="text-sm leading-6 text-rr-secondary">
        Click the button below to verify your email address.
      </p>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={status === "submitting"}
        onClick={handleVerify}
      >
        {status === "submitting" ? "Verifying..." : "Verify email"}
      </Button>
    </div>
  );
}
