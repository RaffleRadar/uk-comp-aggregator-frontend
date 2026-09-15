"use client";

import { SaveHeart } from "@/components/competitions/save-heart";
import { CommentLink } from "@/components/competitions/comment-link";

type SaveActionsProps = {
  competitionId: string;
};

export function SaveActions({ competitionId }: SaveActionsProps) {
  return (
    <>
      <SaveHeart competitionId={competitionId} />
      <CommentLink />
    </>
  );
}
