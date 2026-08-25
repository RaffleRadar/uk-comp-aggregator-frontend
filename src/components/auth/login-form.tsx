"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { AuthClientError } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type FormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type SubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

const initialValues: FormValues = {
  email: "",
  password: "",
};

const cardClass = "rounded-[24px] bg-rr-surface px-5 py-5 shadow-sm sm:px-7 sm:py-6";

const fieldBase =
  "w-full rounded-xl border border-transparent bg-rr-elevated text-sm text-rr-primary outline-none transition placeholder:text-rr-muted caret-rr-primary focus-visible:border-rr-green focus-visible:ring-2 focus-visible:ring-rr-green/20";

const fieldInvalid =
  "border-red-500 dark:border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25";

const labelClass = "text-sm font-medium text-rr-primary";

const errorTextClass = "text-sm text-red-600 dark:text-red-400";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

function getSafeRedirectTarget(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}

function getOauthErrorMessage(error: string | null): string {
  if (!error) return "";

  if (error === "account_exists") {
    return "An account with this email already exists. Sign in with your password, then you can link your social account later.";
  }

  if (error === "oauth_failed") {
    return "Sign-in failed. Please try again.";
  }

  return "Sign-in failed. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const oauthError = getOauthErrorMessage(searchParams.get("error"));
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError("");
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      });
      router.replace(getSafeRedirectTarget(searchParams.get("next")));
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.status === 429) {
          setSubmitError("Too many attempts. Please wait a moment and try again.");
        } else {
          setSubmitError("Email or password is incorrect.");
        }
      } else {
        setSubmitError("Email or password is incorrect.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn(cardClass, "space-y-5")}>
      <div className="space-y-1.5">
        <label htmlFor="login-email" className={labelClass}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
          className={cn(fieldBase, "h-11 px-4", errors.email && fieldInvalid)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
        />
        {errors.email ? (
          <p id="login-email-error" className={errorTextClass}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className={labelClass}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => handleChange("password", event.target.value)}
          className={cn(fieldBase, "h-11 px-4", errors.password && fieldInvalid)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
        />
        {errors.password ? (
          <p id="login-password-error" className={errorTextClass}>
            {errors.password}
          </p>
        ) : null}
      </div>

      {oauthError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {oauthError}
        </div>
      ) : null}

      {submitError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {submitError}
        </div>
      ) : null}

      <div className="space-y-3">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
        <div className="flex flex-col gap-2 text-sm text-rr-secondary sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/register"
            className="text-rr-green no-underline transition-opacity hover:opacity-80"
          >
            Create an account
          </Link>
          <Link
            href="/forgot-password"
            className="text-rr-green no-underline transition-opacity hover:opacity-80"
          >
            Forgot your password?
          </Link>
        </div>
        <SocialButtons />
      </div>
    </form>
  );
}
