"use client";

import { useMemo, useState } from "react";
import type { CommentNode } from "@/lib/api";
import { deleteComment } from "@/lib/comments-client";
import { CommentForm } from "@/components/comments/comment-form";

type CommentItemProps = {
  comment: CommentNode;
  competitionId: string;
  currentUserId: string | null;
  isAuthenticated: boolean;
  isReply: boolean;
  onReplyPosted: (parentId: string, reply: CommentNode) => void;
  onDeleted: (id: string) => void;
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-GB", {
  numeric: "auto",
});

const actionClassName =
  "rounded-md text-xs font-medium text-rr-muted transition hover:text-rr-primary disabled:cursor-not-allowed disabled:opacity-50";

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
  currentUserId,
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
    currentUserId !== null &&
    comment.author?.id === currentUserId;
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
    <div>
      {comment.isDeleted ? (
        <p className="text-sm italic text-rr-muted">Comment removed</p>
      ) : (
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-rr-primary">
              {comment.author?.displayName ?? "Unknown"}
            </span>
            {comment.author?.isStaff ? (
              <span className="whitespace-nowrap rounded-full border border-rr-green-border bg-rr-green-bg px-2 py-0.5 text-[11px] font-medium text-rr-green">
                RaffleRadar
              </span>
            ) : null}
            <time
              dateTime={comment.createdAt}
              title={timestamp.title}
              className="text-xs text-rr-muted"
            >
              {timestamp.label}
            </time>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-rr-secondary">
            {comment.body}
          </p>

          {canReply || canDelete ? (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {canReply ? (
                <button
                  type="button"
                  className={actionClassName}
                  onClick={() => {
                    setDeleteError("");
                    setIsReplyFormOpen((current) => !current);
                  }}
                >
                  {isReplyFormOpen ? "Close" : "Reply"}
                </button>
              ) : null}

              {canDelete ? (
                <button
                  type="button"
                  className={actionClassName}
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}

          {isReplyFormOpen ? (
            <div className="mt-3">
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
            </div>
          ) : null}

          {deleteError ? (
            <p className="mt-2 text-xs text-rr-danger">{deleteError}</p>
          ) : null}
        </div>
      )}

      {hasReplies ? (
        <div className="mt-4 space-y-4 border-l-2 border-rr-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              competitionId={competitionId}
              currentUserId={currentUserId}
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
