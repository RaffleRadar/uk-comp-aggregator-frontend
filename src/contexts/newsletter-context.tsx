"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { AuthClientError } from "@/lib/auth-client";
import { protectedFetch } from "@/lib/protected-fetch";

type NewsletterState = "subscribed" | "pending" | "not_subscribed";

type NewsletterContextValue = {
  state: NewsletterState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  markSubscribedLocally: () => void;
};

const LOCAL_STORAGE_KEY = "newsletter_subscribed";

const NewsletterContext = createContext<NewsletterContextValue | null>(null);

function persistLocalSubscribed(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (value) {
      localStorage.setItem(LOCAL_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch {}
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function newsletterRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await protectedFetch(`/api/newsletter${path}`, init);

  if (!response.ok) {
    const raw = await response.text();
    let message = `HTTP ${response.status}`;

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { message?: string };
        message = parsed.message ?? message;
      } catch {
        message = raw;
      }
    }

    throw new AuthClientError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function NewsletterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  const [serverState, setServerState] = useState<NewsletterState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSubscribed, setLocalSubscribed] = useState<boolean | null>(null);

  const fetchState = useCallback(async () => {
    if (!isAuthenticated) {
      setServerState(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await newsletterRequest<{ state: NewsletterState }>(
        "/me",
      );
      setServerState(response.state);
      const nextLocalSubscribed =
        response.state === "subscribed" || response.state === "pending";
      persistLocalSubscribed(nextLocalSubscribed);
      setLocalSubscribed(nextLocalSubscribed);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load newsletter state."));
      setServerState(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        setLocalSubscribed(localStorage.getItem(LOCAL_STORAGE_KEY) === "1");
      } catch {
        setLocalSubscribed(false);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchState();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchState]);

  const markSubscribedLocally = useCallback(() => {
    persistLocalSubscribed(true);
    setLocalSubscribed(true);
  }, []);

  const effectiveState: NewsletterState | null = useMemo(() => {
    if (isAuthenticated) {
      return serverState;
    }
    if (localSubscribed === true) return "subscribed";
    if (localSubscribed === false) return "not_subscribed";
    return null;
  }, [isAuthenticated, serverState, localSubscribed]);

  const value = useMemo<NewsletterContextValue>(
    () => ({
      state: effectiveState,
      isLoading,
      error,
      refetch: fetchState,
      markSubscribedLocally,
    }),
    [effectiveState, isLoading, error, fetchState, markSubscribedLocally],
  );

  return (
    <NewsletterContext.Provider value={value}>
      {children}
    </NewsletterContext.Provider>
  );
}

export function useNewsletter() {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error("useNewsletter must be used within NewsletterProvider");
  }
  return context;
}
