"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { useAuth } from "@/contexts/auth-context";

type WishlistContextValue = {
  isLoading: boolean;
  isSaved: (competitionId: string) => boolean;
  toggle: (competitionId: string) => Promise<void>;
  openSignInModal: (trigger: HTMLButtonElement | null) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

let cachedUserId: string | null = null;
let cachedIds = new Set<string>();
let cachedRequest: Promise<Set<string>> | null = null;

function cloneIds(ids: Iterable<string>) {
  return new Set(ids);
}

function resetWishlistCache() {
  cachedUserId = null;
  cachedIds = new Set<string>();
  cachedRequest = null;
}

async function wishlistRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function fetchWishlistIdsForUser(userId: string) {
  if (cachedUserId === userId && cachedRequest) {
    return cachedRequest;
  }

  if (cachedUserId === userId) {
    return cloneIds(cachedIds);
  }

  cachedUserId = userId;
  cachedRequest = wishlistRequest<string[]>("/api/wishlists/ids")
    .then((ids) => {
      cachedIds = new Set(ids);
      cachedRequest = null;
      return cloneIds(cachedIds);
    })
    .catch((error) => {
      resetWishlistCache();
      throw error;
    });

  return cachedRequest;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const [ids, setIds] = useState<Set<string>>(() => cloneIds(cachedIds));
  const [isLoading, setIsLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const idsRef = useRef(ids);
  const inFlightIdsRef = useRef(new Set<string>());
  const restoreFocusRef = useRef<HTMLButtonElement | null>(null);
  const loadVersionRef = useRef(0);

  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  const closeSignInModal = useCallback(
    (options?: { restoreFocus?: boolean }) => {
      setIsSignInModalOpen(false);
      const shouldRestoreFocus = options?.restoreFocus !== false;
      const trigger = restoreFocusRef.current;
      restoreFocusRef.current = null;

      if (!shouldRestoreFocus || !trigger) {
        return;
      }

      window.setTimeout(() => {
        if (trigger.isConnected) {
          trigger.focus();
        }
      }, 0);
    },
    [],
  );

  const openSignInModal = useCallback((trigger: HTMLButtonElement | null) => {
    restoreFocusRef.current = trigger;
    setIsSignInModalOpen(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      inFlightIdsRef.current.clear();
      resetWishlistCache();
      const timeoutId = window.setTimeout(() => {
        setIsLoading(false);
        setIds(new Set());
        closeSignInModal({ restoreFocus: false });
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (status !== "authenticated" || !userId) {
      const timeoutId = window.setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const currentVersion = loadVersionRef.current + 1;
    loadVersionRef.current = currentVersion;
    const timeoutId = window.setTimeout(() => {
      if (loadVersionRef.current !== currentVersion) {
        return;
      }

      setIsLoading(true);
    }, 0);

    void fetchWishlistIdsForUser(userId)
      .then((nextIds) => {
        if (loadVersionRef.current !== currentVersion) {
          return;
        }

        setIds(cloneIds(nextIds));
      })
      .catch(() => {
        if (loadVersionRef.current !== currentVersion) {
          return;
        }

        setIds(new Set());
      })
      .finally(() => {
        window.clearTimeout(timeoutId);

        if (loadVersionRef.current !== currentVersion) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [closeSignInModal, status, userId]);

  const toggle = useCallback(
    async (competitionId: string) => {
      if (status !== "authenticated" || !userId) {
        return;
      }

      if (isLoading || inFlightIdsRef.current.has(competitionId)) {
        return;
      }

      const previousIds = cloneIds(idsRef.current);
      const nextIds = cloneIds(previousIds);
      const wasSaved = previousIds.has(competitionId);

      if (wasSaved) {
        nextIds.delete(competitionId);
      } else {
        nextIds.add(competitionId);
      }

      inFlightIdsRef.current.add(competitionId);
      idsRef.current = nextIds;
      setIds(nextIds);
      cachedUserId = userId;
      cachedIds = cloneIds(nextIds);

      try {
        if (wasSaved) {
          await wishlistRequest(
            `/api/wishlists/${encodeURIComponent(competitionId)}`,
            {
              method: "DELETE",
            },
          );
        } else {
          await wishlistRequest("/api/wishlists", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ competitionId }),
          });
        }
      } catch {
        idsRef.current = previousIds;
        setIds(previousIds);
        cachedUserId = userId;
        cachedIds = cloneIds(previousIds);
      } finally {
        inFlightIdsRef.current.delete(competitionId);
      }
    },
    [isLoading, status, userId],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      isLoading,
      isSaved: (competitionId: string) => ids.has(competitionId),
      toggle,
      openSignInModal,
    }),
    [ids, isLoading, openSignInModal, toggle],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
      <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
