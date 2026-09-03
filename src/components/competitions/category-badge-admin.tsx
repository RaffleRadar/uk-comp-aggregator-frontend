"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

type CategoryBadgeAdminProps = {
  competitionId: string;
  category: string | null;
};

function readMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const message = record.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

function capitalizeFirstLetter(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CategoryBadgeAdmin({
  competitionId,
  category,
}: CategoryBadgeAdminProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const router = useRouter();

  const [currentCategory, setCurrentCategory] = useState<string | null>(category);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[] | null>(null);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
  const [error, setError] = useState<string>("");

  const openEdit = useCallback(async () => {
    setIsEditing(true);
    setError("");

    if (hasLoadedCategories) {
      return;
    }

    try {
      const response = await fetch("/api/admin/competitions/categories", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        setIsEditing(false);
        return;
      }

      if (!response.ok) {
        setIsEditing(false);
        return;
      }

      const payload = await parseJsonResponse<unknown>(response);

      if (
        Array.isArray(payload) &&
        payload.every((v) => typeof v === "string")
      ) {
        setCategories(payload as string[]);
        setHasLoadedCategories(true);
      } else {
        setIsEditing(false);
      }
    } catch {
      setIsEditing(false);
    }
  }, [hasLoadedCategories]);

  const saveCategory = useCallback(
    async (nextCategory: string | null) => {
      const previous = currentCategory;
      setCurrentCategory(nextCategory);
      setIsSaving(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/competitions/${encodeURIComponent(competitionId)}`,
          {
            method: "PATCH",
            credentials: "same-origin",
            cache: "no-store",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ category: nextCategory }),
          },
        );

        if (response.status === 401 || response.status === 403) {
          setCurrentCategory(previous);
          setIsEditing(false);
          return;
        }

        let payload: unknown = null;

        try {
          payload = await parseJsonResponse<unknown>(response);
        } catch {
          payload = null;
        }

        if (!response.ok) {
          setCurrentCategory(previous);
          setError(readMessage(payload, "Failed to update category."));
          return;
        }

        if (payload && typeof payload === "object" && "category" in payload) {
          const serverCategory = (payload as { category: unknown }).category;
          if (serverCategory === null || typeof serverCategory === "string") {
            setCurrentCategory(serverCategory);
          }
        }

        setIsEditing(false);
        router.refresh();
      } catch {
        setCurrentCategory(previous);
        setError("Failed to update category.");
      } finally {
        setIsSaving(false);
      }
    },
    [competitionId, currentCategory, router],
  );

  if (!isAdmin) {
    return currentCategory ? (
      <Badge variant="neutral" className="inline-flex h-[22px] items-center text-rr-muted bg-rr-elevated">
        {currentCategory}
      </Badge>
    ) : null;
  }

  if (!isEditing) {
    return (
      <span className="inline-flex items-center">
        <button
          type="button"
          onClick={() => {
            void openEdit();
          }}
          className="inline-flex cursor-pointer items-center leading-none"
        >
          <Badge
            variant="neutral"
            className="inline-flex h-[22px] items-center text-rr-muted bg-rr-elevated hover:bg-rr-elevated/80"
          >
            {currentCategory ?? "Uncategorised"}
          </Badge>
        </button>
        {error ? (
          <span className="ml-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <select
        disabled={isSaving || categories === null}
        value={currentCategory ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          const next = raw === "" ? null : raw;
          void saveCategory(next);
        }}
        className="h-[22px] min-w-[120px] rounded border border-rr-border bg-rr-elevated px-2 text-[10px] text-rr-primary outline-none transition focus-visible:border-rr-green focus-visible:ring-2 focus-visible:ring-rr-green/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <option value="">Uncategorised</option>
        {(categories ?? []).map((cat) => (
          <option key={cat} value={cat}>
            {capitalizeFirstLetter(cat)}
          </option>
        ))}
      </select>
      {error ? (
        <span className="ml-2 text-xs text-red-700 dark:text-red-300">
          {error}
        </span>
      ) : null}
    </span>
  );
}
