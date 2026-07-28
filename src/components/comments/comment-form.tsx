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
  const canSubmit =
    trimmedValue.length >= MIN_COMMENT_LENGTH && !isSubmitting;
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
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-rr-danger-border bg-rr-danger-bg px-4 py-3 text-sm text-rr-danger">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={value}
          maxLength={MAX_COMMENT_LENGTH}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-y rounded-xl border border-rr-border bg-rr-surface px-4 py-3 text-sm text-rr-primary outline-none transition placeholder:text-rr-muted focus-visible:border-rr-green focus-visible:ring-2 focus-visible:ring-rr-green/20"
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (event.metaKey || event.ctrlKey)
            ) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
        />

        {value.length > COUNTER_THRESHOLD ? (
          <div className="text-right text-xs text-rr-muted">
            {value.length}/{MAX_COMMENT_LENGTH}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        ) : null}

        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={!canSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
