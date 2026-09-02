"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function CommentLink() {
  const handleClick = () => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      variant="icon"
      onClick={handleClick}
      aria-label="Jump to comments"
      title="Comments"
    >
      <IconMessageCircle size={20} />
    </Button>
  );
}
