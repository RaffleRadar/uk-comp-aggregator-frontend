"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CommentNode } from "@/lib/api";
import { deleteComment } from "@/lib/comments-client";
import { CommentForm } from "@/components/comments/comment-form";

type CommentItemProps = {
  comment: CommentNode;
  competitionId: string;
  currentUserDisplayName: string | null;
  isAuthenticated: boolean;
  isReply: boolean;
  onReplyPosted: (parentId: string, reply: CommentNode) => void;
  onDeleted: (id: string) => void;
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-GB", {
  numeric: "auto",
});

function getRelativeTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      label: value,
      title: value,
    };
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  const absMinutes = Math.abs(diffMinutes);
  const absHours = Math.abs(diffHours);
  const absDays = Math.abs(diffDays);
  const title = date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (absMinutes < 60) {
    return {
      label: relativeTimeFormatter.format(diffMinutes, "minute"),
      title,
    };
  }

  if (absHours < 24) {
    return {
      label: relativeTimeFormatter.format(diffHours, "hour"),
      title,
    };
  }

  if (absDays < 30) {
    return {
      label: relativeTimeFormatter.format(diffDays, "day"),
      title,
    };
  }

  return {
    label: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    title,
  };
}

export function CommentItem({
  comment,
  competitionId,
  currentUserDisplayName,
  isAuthenticated,
  isReply,
  onReplyPosted,
  onDeleted,
}: CommentItemProps) {
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const timestamp = useMemo(
    () => getRelativeTimestamp(comment.createdAt),
    [comment.createdAt],
  );
  const canReply = !isReply && isAuthenticated;
  const canDelete =
    isAuthenticated &&
    comment.author?.displayName !== null &&
    comment.author?.displayName === currentUserDisplayName;
  const hasReplies = !isReply && comment.replies.length > 0;

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm("Delete this comment?");

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete comment",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      {comment.isDeleted ? (
        <div className="text-sm italic text-rr-muted">Comment removed</div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-rr-border bg-rr-surface p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-rr-primary">
              {comment.author?.displayName ?? "Unknown"}
            </span>
            <time
              dateTime={comment.createdAt}
              title={timestamp.title}
              className="text-xs text-rr-muted"
            >
              {timestamp.label}
            </time>
          </div>

          <div className="whitespace-pre-wrap break-words text-sm text-rr-secondary">
            {comment.body}
          </div>

          {(canReply || canDelete) ? (
            <div className="flex flex-wrap gap-2">
              {canReply ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-3"
                  onClick={() => {
                    setDeleteError("");
                    setIsReplyFormOpen((current) => !current);
                  }}
                >
                  {isReplyFormOpen ? "Close" : "Reply"}
                </Button>
              ) : null}

              {canDelete ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-3"
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              ) : null}
            </div>
          ) : null}

          {isReplyFormOpen ? (
            <CommentForm
              competitionId={competitionId}
              parentId={comment.id}
              autoFocus
              onCancel={() => {
                setIsReplyFormOpen(false);
              }}
              onPosted={(reply) => {
                setDeleteError("");
                setIsReplyFormOpen(false);
                onReplyPosted(comment.id, reply);
              }}
            />
          ) : null}

          {deleteError ? (
            <div className="text-sm text-rr-danger">{deleteError}</div>
          ) : null}
        </div>
      )}

      {hasReplies ? (
        <div className="space-y-4 border-l border-rr-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              competitionId={competitionId}
              currentUserDisplayName={currentUserDisplayName}
              isAuthenticated={isAuthenticated}
              isReply
              onReplyPosted={onReplyPosted}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
