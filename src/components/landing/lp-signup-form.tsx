"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { pushEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type SubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

type LpSignupFormProps = {
  campaign: string;
  placement: string;
  className?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LpSignupForm({ campaign, placement, className }: LpSignupFormProps) {
  const router = useRouter();
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const trimmed = email.trim();

    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("That email address doesn't look right.");
      return;
    }

    setError("");
    pushEvent("lp_signup_start", { lp_campaign: campaign, lp_placement: placement });
    router.push(
      `/register?email=${encodeURIComponent(trimmed)}&next=%2F&lp=${encodeURIComponent(campaign)}`,
    );
  }

  return (
    <form className={cn("w-full max-w-[520px]", className)} onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-[52px] w-full rounded-xl border border-rr-border bg-rr-elevated px-4 text-[15px] text-rr-primary outline-none transition placeholder:text-rr-muted caret-rr-primary focus-visible:border-rr-green focus-visible:ring-2 focus-visible:ring-rr-green/20 sm:flex-1",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/25",
          )}
        />
        <Button type="submit" className="h-[52px] shrink-0 px-6 text-[15px]">
          Create free account
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </form>
  );
}
