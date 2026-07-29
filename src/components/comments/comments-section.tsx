"use client";

import { useEffect, useMemo, useState } from "react";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { CommentNode } from "@/lib/api";

type CommentsSectionProps = {
  competitionId: string;
  initialComments: CommentNode[];
};

function countVisibleComments(comments: CommentNode[]): number {
  return comments.reduce((total, comment) => {
    const ownCount = comment.isDeleted ? 0 : 1;
    return total + ownCount + countVisibleComments(comment.replies);
  }, 0);
}

function countVisibleReplies(comments: CommentNode[]): number {
  return comments.reduce(
    (total, comment) => total + (comment.isDeleted ? 0 : 1),
    0,
  );
}

function appendReplyToParent(
  comments: CommentNode[],
  parentId: string,
  reply: CommentNode,
): CommentNode[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...comment.replies, reply],
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: appendReplyToParent(comment.replies, parentId, reply),
    };
  });
}

function removeDeletedComment(
  comments: CommentNode[],
  id: string,
  isTopLevel: boolean,
): { comments: CommentNode[]; removed: boolean } {
  let removed = false;
  const nextComments: CommentNode[] = [];

  for (const comment of comments) {
    if (comment.id === id) {
      removed = true;

      if (isTopLevel && countVisibleReplies(comment.replies) > 0) {
        nextComments.push({
          ...comment,
          body: null,
          isDeleted: true,
          author: null,
        });
      }

      continue;
    }

    let nextComment = comment;

    if (comment.replies.length > 0) {
      const result = removeDeletedComment(comment.replies, id, false);

      if (result.removed) {
        removed = true;
        nextComment = {
          ...comment,
          replies: result.comments,
        };
      }
    }

    if (
      nextComment.isDeleted &&
      countVisibleReplies(nextComment.replies) === 0
    ) {
      if (isTopLevel) {
        continue;
      }

      removed = true;
      continue;
    }

    nextComments.push(nextComment);
  }

  return {
    comments: nextComments,
    removed,
  };
}

export function CommentsSection({
  competitionId,
  initialComments,
}: CommentsSectionProps) {
  const { status, user } = useAuth();
  const [comments, setComments] = useState<CommentNode[]>(initialComments);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setComments(initialComments);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialComments]);

  const isAuthenticated = status === "authenticated";
  const currentUserId = user?.id ?? null;
  const visibleCount = useMemo(
    () => countVisibleComments(comments),
    [comments],
  );

  return (
    <section className="mt-10 border-t border-rr-border pt-8">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-rr-primary">
          Comments {visibleCount}
        </h2>

        {status === "authenticated" ? (
          <CommentForm
            competitionId={competitionId}
            onPosted={(comment) => {
              setComments((current) => [comment, ...current]);
            }}
          />
        ) : null}

        {status === "unauthenticated" ? (
          <div className="rounded-2xl border border-rr-border bg-rr-surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-rr-secondary">
                Sign in to join the conversation
              </p>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  setIsSignInModalOpen(true);
                }}
              >
                Sign in
              </Button>
            </div>
          </div>
        ) : null}

        {comments.length === 0 ? (
          <div className="text-sm text-rr-muted">
            No comments yet. Be the first to post.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                competitionId={competitionId}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
                isReply={false}
                onReplyPosted={(parentId, reply) => {
                  setComments((current) =>
                    appendReplyToParent(current, parentId, reply),
                  );
                }}
                onDeleted={(id) => {
                  setComments((current) =>
                    removeDeletedComment(current, id, true).comments,
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => {
          setIsSignInModalOpen(false);
        }}
      />
    </section>
  );
}
