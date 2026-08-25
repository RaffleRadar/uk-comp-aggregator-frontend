import { Suspense } from "react";
import { RegisterForm } from "../../../components/auth/register-form";
import { RegisterHero } from "@/components/auth/register-hero";

export default function Page() {
  return (
    <main className="py-10 sm:py-14">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_440px] lg:gap-12 xl:gap-16">
          <div className="order-2 min-w-0 lg:order-1">
            <RegisterHero />
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <div className="rounded-2xl border border-rr-border bg-rr-elevated p-7 sm:p-8">
              <div className="mb-6 space-y-2">
                <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-rr-primary">
                  Create your free account
                </h2>
                <p className="text-[15px] leading-7 text-rr-secondary">
                  It takes less than a minute.
                </p>
              </div>

              <Suspense fallback={null}>
                <RegisterForm />
              </Suspense>

              <p className="mt-5 text-[14px] text-rr-muted">
                Free to join. No subscription. Unsubscribe in one click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
