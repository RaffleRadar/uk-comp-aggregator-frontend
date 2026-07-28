"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authFetchJson, type AuthUser } from "@/lib/auth-client";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { DeleteAccount } from "@/components/account/delete-account";
import { NewsletterSettings } from "@/components/account/newsletter-settings";
import { SessionsList } from "@/components/account/sessions-list";

type MeResponse = AuthUser & {
  googleId?: string | null;
  facebookId?: string | null;
};

const cardClass = "rounded-2xl border border-rr-border bg-rr-surface p-6";
const titleClass = "mb-1 text-base font-medium text-rr-primary";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatSignInStatus(value: boolean) {
  return value ? "Connected" : "Not connected";
}

export function SettingsSection() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await authFetchJson<MeResponse>("/me");
        if (!cancelled) {
          setMe(response);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, "Failed to load sign-in details."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const methods = useMemo(() => {
    const googleConnected = Boolean(me?.googleId);
    const facebookConnected = Boolean(me?.facebookId);
    const passwordSet = Boolean(me?.hasPassword);

    return {
      passwordSet,
      googleConnected,
      facebookConnected,
    };
  }, [me]);

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <h3 className={titleClass}>Sign-in details</h3>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-rr-primary">Email</div>
            {isLoading ? (
              <div className="text-sm text-rr-secondary">Loading...</div>
            ) : loadError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
              >
                {loadError}
              </div>
            ) : (
              <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-3 text-sm text-rr-primary">
                {me?.email || "—"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-rr-primary">Methods</div>
            <dl className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-3">
                <dt className="text-sm text-rr-secondary">Password</dt>
                <dd className="mt-0.5 text-sm font-medium text-rr-primary">
                  {me ? (methods.passwordSet ? "Set" : "Not set") : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-3">
                <dt className="text-sm text-rr-secondary">Google</dt>
                <dd className="mt-0.5 text-sm font-medium text-rr-primary">
                  {me ? formatSignInStatus(methods.googleConnected) : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-3">
                <dt className="text-sm text-rr-secondary">Facebook</dt>
                <dd className="mt-0.5 text-sm font-medium text-rr-primary">
                  {me ? formatSignInStatus(methods.facebookConnected) : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <ChangePasswordForm
        hasPassword={me ? methods.passwordSet : null}
        email={me?.email ?? null}
        providerLabel={methods.googleConnected ? "Google" : methods.facebookConnected ? "Facebook" : null}
      />

      <NewsletterSettings />

      <SessionsList />

      <DeleteAccount />

      <p className="text-sm leading-6 text-rr-secondary">
        For what is stored about your account and how long it is kept, see our{" "}
        <Link href="/privacy" className="text-rr-green underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
