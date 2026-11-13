"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { useAuth } from "@/contexts/auth-context";
import { protectedFetch } from "@/lib/protected-fetch";
import {
  canOpenOperatorDashboard,
  operatorDashboardMePath,
  type OperatorDashboardMe,
  type OperatorDashboardOperator,
} from "@/lib/operator-dashboard";

type LoadedState =
  | { kind: "ready"; operator: OperatorDashboardOperator }
  | { kind: "not-linked" }
  | { kind: "other-operator" }
  | { kind: "choose-operator" }
  | { kind: "error"; message: string };

type ViewState = { kind: "loading" } | LoadedState;

const LOAD_ERROR = "The dashboard could not be loaded. Please try again later.";

async function loadOperator(path: string): Promise<LoadedState> {
  try {
    const response = await protectedFetch(path, { cache: "no-store" });

    if (response.status === 403) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return body?.message?.toLowerCase().includes("not linked")
        ? { kind: "not-linked" }
        : { kind: "other-operator" };
    }
    if (response.status === 400) return { kind: "choose-operator" };
    if (response.status === 404) {
      return { kind: "error", message: "Operator not found." };
    }
    if (!response.ok) return { kind: "error", message: LOAD_ERROR };

    const data = (await response.json()) as OperatorDashboardMe;
    return { kind: "ready", operator: data.operator };
  } catch {
    return { kind: "error", message: LOAD_ERROR };
  }
}

function siteHost(baseUrl: string) {
  try {
    return new URL(baseUrl).host.replace(/^www\./, "");
  } catch {
    return baseUrl;
  }
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-rr-border bg-rr-surface p-6">
      <h1 className="text-lg font-semibold text-rr-primary">{title}</h1>
      <p className="mt-2 text-sm text-rr-secondary">{text}</p>
    </div>
  );
}

export function OperatorDashboardView() {
  const { status, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOperatorId = searchParams.get("operatorId");
  const role = user?.role ?? null;
  const allowed = canOpenOperatorDashboard(role);
  const needsOperatorChoice = role === "admin" && !requestedOperatorId?.trim();
  const requestPath =
    status === "authenticated" && allowed && !needsOperatorChoice
      ? operatorDashboardMePath(requestedOperatorId)
      : null;
  const [loaded, setLoaded] = useState<{
    path: string;
    state: LoadedState;
  } | null>(null);

  useEffect(() => {
    if (status === "authenticated" && !allowed) {
      router.replace("/profile");
    }
  }, [allowed, router, status]);

  useEffect(() => {
    if (!requestPath) {
      return;
    }

    let cancelled = false;

    void loadOperator(requestPath).then((result) => {
      if (!cancelled) {
        setLoaded({ path: requestPath, state: result });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [requestPath]);

  const state: ViewState = needsOperatorChoice
    ? { kind: "choose-operator" }
    : loaded && loaded.path === requestPath
      ? loaded.state
      : { kind: "loading" };

  if (!allowed) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {state.kind === "loading" ? (
        <div className="flex justify-center py-16">
          <RadarLoader size="md" />
        </div>
      ) : null}

      {state.kind === "not-linked" ? (
        <Notice
          title="Operator dashboard"
          text="This account is not linked to an operator yet. Please contact RaffleRadar to get access."
        />
      ) : null}

      {state.kind === "other-operator" ? (
        <Notice
          title="Operator dashboard"
          text="You can only view the dashboard of your own operator."
        />
      ) : null}

      {state.kind === "choose-operator" ? (
        <Notice
          title="Operator dashboard"
          text="Add ?operatorId= with an operator id to the address to view that operator's dashboard."
        />
      ) : null}

      {state.kind === "error" ? (
        <Notice title="Operator dashboard" text={state.message} />
      ) : null}

      {state.kind === "ready" ? (
        <div className="space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-rr-muted">
              Operator dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-rr-primary sm:text-3xl">
              {state.operator.name}
            </h1>
            <p className="mt-1 text-sm text-rr-secondary">
              {siteHost(state.operator.baseUrl)}
            </p>
          </header>
          <div className="rounded-2xl border border-rr-border bg-rr-surface p-6 text-sm text-rr-secondary">
            Market overview is being prepared.
          </div>
        </div>
      ) : null}
    </div>
  );
}
