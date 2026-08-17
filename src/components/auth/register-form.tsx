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
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type SubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

const initialValues: FormValues = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
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

  const trimmedDisplayName = values.displayName.trim();

  if (!trimmedDisplayName) {
    errors.displayName = "Enter a display name.";
  } else if (trimmedDisplayName.length < 2) {
    errors.displayName = "Display name must be at least 2 characters.";
  } else if (trimmedDisplayName.length > 80) {
    errors.displayName = "Display name must be 80 characters or fewer.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }

  if (!values.password) {
    errors.password = "Enter a password.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function getSafeRedirectTarget(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [values, setValues] = useState<FormValues>(() => ({
    ...initialValues,
    email: searchParams.get("email")?.trim() ?? "",
  }));
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
      await register({
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      router.replace(getSafeRedirectTarget(searchParams.get("next")));
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.status === 409) {
          setSubmitError("An account with this email already exists.");
        } else if (error.status === 429) {
          setSubmitError("Too many attempts. Please wait a moment and try again.");
        } else {
          setSubmitError("We could not create your account. Please try again.");
        }
      } else {
        setSubmitError("We could not create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn(cardClass, "space-y-5")}>
      <div className="space-y-1.5">
        <label htmlFor="register-display-name" className={labelClass}>
          Display name
        </label>
        <input
          id="register-display-name"
          type="text"
          autoComplete="nickname"
          value={values.displayName}
          onChange={(event) => handleChange("displayName", event.target.value)}
          className={cn(fieldBase, "h-11 px-4", errors.displayName && fieldInvalid)}
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={errors.displayName ? "register-display-name-error" : undefined}
        />
        {errors.displayName ? (
          <p id="register-display-name-error" className={errorTextClass}>
            {errors.displayName}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-email" className={labelClass}>
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
          className={cn(fieldBase, "h-11 px-4", errors.email && fieldInvalid)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
        />
        {errors.email ? (
          <p id="register-email-error" className={errorTextClass}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className={labelClass}>
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => handleChange("password", event.target.value)}
          className={cn(fieldBase, "h-11 px-4", errors.password && fieldInvalid)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "register-password-error" : undefined}
        />
        {errors.password ? (
          <p id="register-password-error" className={errorTextClass}>
            {errors.password}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-confirm-password" className={labelClass}>
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => handleChange("confirmPassword", event.target.value)}
          className={cn(fieldBase, "h-11 px-4", errors.confirmPassword && fieldInvalid)}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? "register-confirm-password-error" : undefined
          }
        />
        {errors.confirmPassword ? (
          <p id="register-confirm-password-error" className={errorTextClass}>
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

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
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
        <p className="text-xs leading-5 text-rr-secondary">
          Creating an account means your details are handled as described in our{" "}
          <Link href="/privacy" className="text-rr-green underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
        <div className="text-sm text-rr-secondary">
          <Link
            href="/login"
            className="text-rr-green no-underline transition-opacity hover:opacity-80"
          >
            Already have an account? Log in
          </Link>
        </div>
        <SocialButtons />
      </div>
    </form>
  );
}
