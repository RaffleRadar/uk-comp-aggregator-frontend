"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CommentNode } from "@/lib/api";
import { postComment } from "@/lib/comments-client";

type CommentFormProps = {
  competitionId: string;
  parentId?: string;
  onPosted: (comment: CommentNode) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
};

const MAX_COMMENT_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 2;
const COUNTER_THRESHOLD = 1800;

export function CommentForm({
  competitionId,
  parentId,
  onPosted,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedValue = useMemo(() => value.trim(), [value]);
  const canSubmit = trimmedValue.length >= MIN_COMMENT_LENGTH && !isSubmitting;
  const submitLabel = parentId ? "Reply" : "Post";
  const placeholder = parentId ? "Write a reply" : "Add a comment";

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    textareaRef.current?.focus();
  }, [autoFocus]);

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const comment = await postComment({
        competitionId,
        body: trimmedValue,
        parentId,
      });

      setValue("");
      setError("");
      onPosted(comment);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to post comment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-2 rounded-lg border border-rr-danger-border bg-rr-danger-bg px-3 py-2 text-sm text-rr-danger">
          {error}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={value}
        maxLength={MAX_COMMENT_LENGTH}
        rows={parentId ? 2 : 3}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-rr-border bg-rr-surface px-3 py-2.5 text-sm leading-relaxed text-rr-primary outline-none transition placeholder:text-rr-muted focus-visible:border-rr-border focus-visible:ring-2 focus-visible:ring-rr-border"
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void handleSubmit();
          }
        }}
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-rr-muted">
          {value.length > COUNTER_THRESHOLD
            ? `${value.length}/${MAX_COMMENT_LENGTH}`
            : ""}
        </span>

        <div className="flex items-center gap-2">
          {onCancel ? (
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-rr-muted transition hover:text-rr-primary disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          ) : null}

          <Button
            type="button"
            className="h-11 min-w-[112px] rounded-lg px-5 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
          >
            {isSubmitting ? "Posting" : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
