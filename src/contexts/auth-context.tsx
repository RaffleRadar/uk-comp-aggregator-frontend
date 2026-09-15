"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  AuthClientError,
  authFetchJson,
  authRequest,
  authRequestJson,
  hasSessionHint,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/lib/auth-client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthState["status"];
  error: string | null;
  isAuthenticated: boolean;
  login(input: LoginInput): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
  refreshMe(): Promise<void>;
};

type Action =
  | { type: "loading" }
  | { type: "authenticated"; user: AuthUser }
  | { type: "unauthenticated"; error: string | null }
  | { type: "setError"; error: string | null };

const AuthContext = createContext<AuthContextValue | null>(null);

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "loading":
      return { ...state, status: "loading", error: null };
    case "authenticated":
      return { user: action.user, status: "authenticated", error: null };
    case "unauthenticated":
      return { user: null, status: "unauthenticated", error: action.error };
    case "setError":
      return { ...state, error: action.error };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  status: "loading",
  error: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshMe = useCallback(async () => {
    if (!hasSessionHint()) {
      dispatch({ type: "unauthenticated", error: null });
      return;
    }

    try {
      const user = await authFetchJson<AuthUser>("/me");
      dispatch({ type: "authenticated", user });
    } catch (error) {
      if (error instanceof AuthClientError && error.status === 401) {
        dispatch({ type: "unauthenticated", error: null });
        return;
      }

      dispatch({
        type: "setError",
        error: getErrorMessage(error, "Failed to load user"),
      });
      throw error;
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    dispatch({ type: "loading" });

    try {
      const response = await authRequestJson<{ user: AuthUser }>("/login", {
        method: "POST",
        body: input,
      });
      dispatch({ type: "authenticated", user: response.user });
    } catch (error) {
      dispatch({
        type: "unauthenticated",
        error: getErrorMessage(error, "Login failed"),
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    dispatch({ type: "loading" });

    try {
      const response = await authRequestJson<{ user: AuthUser }>("/register", {
        method: "POST",
        body: input,
      });
      dispatch({ type: "authenticated", user: response.user });
    } catch (error) {
      dispatch({
        type: "unauthenticated",
        error: getErrorMessage(error, "Register failed"),
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: "loading" });

    try {
      await authRequest("/logout", { method: "POST" });
    } catch {}

    dispatch({ type: "unauthenticated", error: null });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasSessionHint()) {
        dispatch({ type: "unauthenticated", error: null });
        return;
      }

      try {
        const user = await authFetchJson<AuthUser>("/me");
        if (!cancelled) {
          dispatch({ type: "authenticated", user });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof AuthClientError && error.status === 401) {
          dispatch({ type: "unauthenticated", error: null });
          return;
        }
        dispatch({
          type: "unauthenticated",
          error: getErrorMessage(error, "Failed to load user"),
        });
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      error: state.error,
      isAuthenticated: state.status === "authenticated",
      login,
      register,
      logout,
      refreshMe,
    }),
    [login, logout, refreshMe, register, state.error, state.status, state.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}