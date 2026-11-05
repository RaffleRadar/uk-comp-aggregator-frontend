"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

const reasonOptions = [
  "General enquiry",
  "Operator enquiry",
  "Report a problem",
  "Partnership",
  "Press",
] as const;

type FormValues = {
  name: string;
  email: string;
  reason: string;
  message: string;
  _gotcha: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type SubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

const initialValues: FormValues = {
  name: "",
  email: "",
  reason: "",
  message: "",
  _gotcha: "",
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

  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }

  if (!values.reason.trim()) {
    errors.reason = "Choose a reason.";
  }

  if (!values.message.trim()) {
    errors.message = "Enter your message.";
  }

  return errors;
}

function ContactBadge() {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rr-elevated">
        <Image
          src="/favnew.svg"
          alt="RaffleRadar"
          width={28}
          height={28}
          className="h-7 w-7"
          priority
        />
      </div>
      <div>
        <p className="text-sm font-medium text-rr-primary">Contact RaffleRadar</p>
        <p className="text-sm text-rr-muted">We usually reply within a day.</p>
      </div>
    </div>
  );
}

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const reasonRef = useRef<HTMLDivElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!reasonRef.current?.contains(event.target as Node)) {
        setIsReasonOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsReasonOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const intro = document.getElementById("contact-page-intro");
    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    if (!intro || !isMobile) {
      return;
    }

    if (!isSubmitted) {
      intro.classList.remove("hidden");
      return;
    }

    intro.classList.add("hidden");

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return () => {
      intro.classList.remove("hidden");
    };
  }, [isSubmitted]);

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
      if (!FORMSPREE_ENDPOINT) {
        throw new Error("The contact form is unavailable right now. Try again later.");
      }

      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("email", values.email.trim());
      formData.append("reason", values.reason);
      formData.append("message", values.message.trim());
      formData.append("_gotcha", values._gotcha);
      formData.append("_subject", `RaffleRadar contact: ${values.reason}`);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "errors" in payload
            ? Array.isArray(payload.errors) && payload.errors[0]?.message
              ? String(payload.errors[0].message)
              : ""
            : "";

        throw new Error(message || "Your enquiry didn't send. Try again.");
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Your enquiry didn't send. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div ref={successRef} className={cardClass}>
        <ContactBadge />
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-rr-green">
          Message sent
        </p>
        <h2 className="mt-2 text-xl font-medium tracking-[-0.03em] text-rr-primary sm:hidden">
          Thanks, your email has been sent.
        </h2>
        <h2 className="mt-2 hidden text-2xl font-medium tracking-[-0.03em] text-rr-primary sm:block">
          Thanks, your enquiry is on its way.
        </h2>
        <p className="mt-2 hidden text-[15.5px] leading-7 text-rr-secondary sm:block">
          We have received your message and will reply by email as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn(cardClass, "relative space-y-5")}>
      <ContactBadge />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className={labelClass}>
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className={cn(fieldBase, "h-11 px-4", errors.name && fieldInvalid)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name ? (
            <p id="contact-name-error" className={errorTextClass}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className={cn(fieldBase, "h-11 px-4", errors.email && fieldInvalid)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email ? (
            <p id="contact-email-error" className={errorTextClass}>
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div ref={reasonRef} className="relative space-y-1.5">
        <label htmlFor="contact-reason-trigger" className={labelClass}>
          Reason
        </label>
        <input name="reason" value={values.reason} readOnly className="sr-only" tabIndex={-1} />
        <button
          id="contact-reason-trigger"
          type="button"
          onClick={() => setIsReasonOpen((current) => !current)}
          className={cn(
            fieldBase,
            "flex h-11 items-center justify-between px-4 text-left hover:border-rr-green/40",
            errors.reason && fieldInvalid,
          )}
          aria-haspopup="listbox"
          aria-expanded={isReasonOpen}
          aria-describedby={errors.reason ? "contact-reason-error" : undefined}
        >
          <span className={values.reason ? "text-rr-primary" : "text-rr-muted"}>
            {values.reason || "Select a reason"}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              "shrink-0 text-rr-muted transition-transform",
              isReasonOpen && "rotate-180",
            )}
            aria-hidden
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isReasonOpen ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-rr-border bg-rr-elevated shadow-lg">
            <ul role="listbox" aria-labelledby="contact-reason-trigger" className="py-1">
              {reasonOptions.map((reason) => {
                const isActive = values.reason === reason;

                return (
                  <li key={reason}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2 text-left text-sm transition",
                        isActive
                          ? "bg-rr-green/15 text-rr-primary"
                          : "text-rr-secondary hover:bg-rr-surface hover:text-rr-primary",
                      )}
                      onClick={() => {
                        handleChange("reason", reason);
                        setIsReasonOpen(false);
                      }}
                    >
                      <span>{reason}</span>
                      {isActive ? (
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-rr-green">
                          Selected
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {errors.reason ? (
          <p id="contact-reason-error" className={errorTextClass}>
            {errors.reason}
          </p>
        ) : null}
        {values.reason === "Operator enquiry" ? (
          <p className="text-sm text-rr-secondary">
            Interested in having your competition website featured on RaffleRadar? Please read our{" "}
            <Link href="/get-listed" className="font-medium text-rr-green underline underline-offset-2">
              Get Listed
            </Link>{" "}
            page before getting in touch.
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
          rows={4}
          className={cn(
            fieldBase,
            "min-h-[112px] resize-y px-4 py-3 leading-6",
            errors.message && fieldInvalid,
          )}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" className={errorTextClass}>
            {errors.message}
          </p>
        ) : null}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
      >
        <label htmlFor="contact-company">Leave this field empty</label>
        <input
          id="contact-company"
          name="_gotcha"
          type="text"
          value={values._gotcha}
          onChange={(event) => handleChange("_gotcha", event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-rr-muted">
          We will reply to the email address you provide here.
        </p>
        <Button type="submit" disabled={isSubmitting} className="min-w-[168px]">
          {isSubmitting ? "Sending..." : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}