"use client";

import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/protected-fetch";

export type DashboardResource<T> = {
  data: T | null;
  status: "loading" | "ready" | "error";
  stale: boolean;
};

export function useDashboardResource<T>(
  path: string | null,
): DashboardResource<T> {
  const [latest, setLatest] = useState<{
    path: string;
    body: T | null;
  } | null>(null);
  const [lastGood, setLastGood] = useState<T | null>(null);

  useEffect(() => {
    if (!path) return;

    let cancelled = false;

    protectedFetch(path, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Request failed");
        const body = (await response.json()) as T;
        if (!cancelled) {
          setLatest({ path, body });
          setLastGood(body);
        }
      })
      .catch(() => {
        if (!cancelled) setLatest({ path, body: null });
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  const current = latest && latest.path === path ? latest : null;

  if (current) {
    return current.body !== null
      ? { data: current.body, status: "ready", stale: false }
      : { data: null, status: "error", stale: false };
  }

  return { data: lastGood, status: "loading", stale: lastGood !== null };
}
