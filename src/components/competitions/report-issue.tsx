"use client";

import { useEffect, useState } from "react";
import { IconFlag, IconX, IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type ReportIssueProps = {
  competitionId: string;
};

const REASONS = [
  { value: "ticket_price", label: "Ticket price is wrong" },
  { value: "tickets_total", label: "Total tickets count is wrong" },
  { value: "already_closed", label: "Competition is already closed" },
  { value: "broken_image", label: "Image is missing or broken" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "other", label: "Something else" },
] as const;

export function ReportIssue({ competitionId }: ReportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setReason("");
      setComment("");
      setError(null);
    }, 300);
  }

  async function handleSubmit() {
    if (!reason || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/competitions/${competitionId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
            comment: comment.trim() || null,
          }),
        },
      );

      const data = (await response.json().catch(() => ({ ok: false }))) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.message ?? "Failed to submit report. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[12px] text-rr-muted underline-offset-2 hover:underline hover:text-rr-secondary transition-colors"
      >
        <IconFlag size={14} />
        Report an issue with this listing
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-rr-elevated/80 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        handleClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-issue-title"
        aria-describedby="report-issue-description"
        className="w-full max-w-md rounded-2xl border border-rr-border bg-rr-surface p-5 shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="report-issue-title"
              className="text-lg font-semibold text-rr-primary mb-1"
            >
              Report an issue
            </h2>
            <p
              id="report-issue-description"
              className="text-xs text-rr-muted mb-5"
            >
              Pick the reason below so our team can investigate.
            </p>
          </div>
          <Button
            variant="icon"
            aria-label="Close report dialog"
            onClick={handleClose}
            className="shrink-0"
          >
            <IconX size={18} />
          </Button>
        </div>

        {!submitted ? (
          <>
            <fieldset className="space-y-2.5 mb-5">
              <legend className="sr-only">Reason for reporting</legend>
              {REASONS.map((item) => (
                <label
                  key={item.value}
                  className="flex items-start gap-3 rounded-[10px] border border-rr-border bg-rr-bg p-3 cursor-pointer transition-colors hover:border-rr-green/50 has-[:checked]:border-rr-green has-[:checked]:bg-rr-green-bg/20"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-rr-border text-rr-green focus:ring-rr-green"
                  />
                  <span className="text-sm text-rr-primary">
                    <span className="font-medium">{item.label}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mb-5">
              <label
                htmlFor="report-comment"
                className="block text-xs text-rr-muted mb-1"
              >
                Additional details (optional)
              </label>
              <textarea
                id="report-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Add any extra context that might help our team..."
                className="w-full rounded-[10px] border border-rr-border bg-rr-bg px-3 py-2.5 text-sm text-rr-primary placeholder:text-rr-muted focus:border-rr-green focus:outline-none resize-none"
                rows={3}
                maxLength={500}
              />
              {comment.length > 0 && (
                <p className="text-right text-[11px] text-rr-muted mt-1">
                  {comment.length}/500
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              disabled={!reason || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit report"}
            </Button>

            {error ? (
              <div className="mt-3 rounded-[8px] border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <IconCircleCheck size={40} className="mx-auto text-rr-green mb-3" />
            <h3 className="text-base font-semibold text-rr-primary mb-1 text-center">
              Thank you!
            </h3>
            <p className="text-sm text-rr-secondary text-center mb-4">
              Our team will review this report within 24 hours.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => {
                  setSubmitted(false);
                  setReason("");
                  setComment("");
                  setError(null);
                }, 300);
              }}
            >
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
