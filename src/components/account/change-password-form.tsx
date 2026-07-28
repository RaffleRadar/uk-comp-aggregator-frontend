"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { AuthClientError, authFetch } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type SubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

type ChangePasswordFormProps = {
  hasPassword: boolean | null;
  email: string | null;
  providerLabel: string | null;
};

const cardClass = "rounded-2xl border border-rr-border bg-rr-surface p-6";
const titleClass = "mb-1 text-base font-medium text-rr-primary";
const subtitleClass = "text-sm text-rr-secondary";

const fieldBase =
  "w-full rounded-xl border border-transparent bg-rr-elevated text-sm text-rr-primary outline-none transition placeholder:text-rr-muted caret-rr-primary focus-visible:border-rr-green focus-visible:ring-2 focus-visible:ring-rr-green/20";
const fieldInvalid =
  "border-red-500 dark:border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25";
const labelClass = "text-sm font-medium text-rr-primary";
const errorTextClass = "text-sm text-red-600 dark:text-red-400";

const initialValues: FormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Enter your current password.";
  }

  if (!values.newPassword) {
    errors.newPassword = "Enter a new password.";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function ChangePasswordForm({
  hasPassword,
  email,
  providerLabel,
}: ChangePasswordFormProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState("");
  const [setPasswordSuccess, setSetPasswordSuccess] = useState(false);
  const [isRequestingSetPassword, setIsRequestingSetPassword] = useState(false);

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

  async function handleSetPasswordRequest() {
    setSetPasswordError("");
    setIsRequestingSetPassword(true);

    try {
      await authFetch("/set-password/request", {
        method: "POST",
      });
      setSetPasswordSuccess(true);
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.status === 429) {
          setSetPasswordError("Too many attempts. Please wait a moment and try again.");
        } else {
          setSetPasswordError(error.message || "Failed to send set password email.");
        }
      } else {
        setSetPasswordError("Failed to send set password email.");
      }
    } finally {
      setIsRequestingSetPassword(false);
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const confirmed = window.confirm(
      "Changing your password signs you out everywhere, including this device. Continue?",
    );
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authFetch("/change-password", {
        method: "POST",
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

      await logout();
      router.replace("/login");
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.status === 401) {
          setSubmitError("Current password is incorrect.");
        } else if (error.status === 429) {
          setSubmitError("Too many attempts. Please wait a moment and try again.");
        } else {
          setSubmitError(error.message || "Failed to change password.");
        }
      } else {
        setSubmitError("Failed to change password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={cardClass}>
      <h3 className={titleClass}>Change password</h3>
      <p className={subtitleClass}>
        New password must be at least 8 characters. This signs you out everywhere.
      </p>

      {hasPassword === null ? (
        <div className="mt-4 rounded-xl border border-rr-border bg-rr-elevated px-4 py-3 text-sm text-rr-secondary">
          Loading password settings...
        </div>
      ) : !hasPassword ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-3 text-sm text-rr-secondary">
            {providerLabel
              ? `This account signs in with ${providerLabel}. You can add a password by email and then use either sign-in method.`
              : "This account does not have a password yet. You can add one by email and then sign in with either method."}
          </div>

          {setPasswordSuccess ? (
            <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-3 text-sm text-rr-secondary">
              {email
                ? `We sent a set password link to ${email}.`
                : "We sent a set password link to your account email."}
            </div>
          ) : null}

          {setPasswordError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
            >
              {setPasswordError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isRequestingSetPassword || setPasswordSuccess}
              onClick={handleSetPasswordRequest}
            >
              {setPasswordSuccess
                ? "Link sent"
                : isRequestingSetPassword
                  ? "Sending..."
                  : "Email me a set password link"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="change-password-current" className={labelClass}>
              Current password
            </label>
            <input
              id="change-password-current"
              type="password"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={(event) => handleChange("currentPassword", event.target.value)}
              className={cn(fieldBase, "h-11 px-4", errors.currentPassword && fieldInvalid)}
              aria-invalid={Boolean(errors.currentPassword)}
              aria-describedby={errors.currentPassword ? "change-password-current-error" : undefined}
            />
            {errors.currentPassword ? (
              <p id="change-password-current-error" className={errorTextClass}>
                {errors.currentPassword}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="change-password-new" className={labelClass}>
              New password
            </label>
            <input
              id="change-password-new"
              type="password"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={(event) => handleChange("newPassword", event.target.value)}
              className={cn(fieldBase, "h-11 px-4", errors.newPassword && fieldInvalid)}
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={errors.newPassword ? "change-password-new-error" : undefined}
            />
            {errors.newPassword ? (
              <p id="change-password-new-error" className={errorTextClass}>
                {errors.newPassword}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="change-password-confirm" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="change-password-confirm"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(event) => handleChange("confirmPassword", event.target.value)}
              className={cn(fieldBase, "h-11 px-4", errors.confirmPassword && fieldInvalid)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "change-password-confirm-error" : undefined
              }
            />
            {errors.confirmPassword ? (
              <p id="change-password-confirm-error" className={errorTextClass}>
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

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Changing..." : "Change password"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
