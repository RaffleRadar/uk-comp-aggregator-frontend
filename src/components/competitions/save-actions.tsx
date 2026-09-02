"use client";

import { usePathname } from "next/navigation";
import { SaveHeart } from "@/components/competitions/save-heart";
import { CommentLink } from "@/components/competitions/comment-link";

export function SaveActions() {
  const pathname = usePathname();
  const competitionId = pathname.match(/^\/competitions\/([^/]+)/)?.[1] ?? null;

  return (
    <>
      {competitionId ? <SaveHeart competitionId={competitionId} /> : null}
      <CommentLink />
    </>
  );
}
