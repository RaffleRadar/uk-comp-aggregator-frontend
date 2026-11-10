import type { ReactNode } from "react";

export function OperatorSectionHeading({ children }: { children: ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold uppercase tracking-[0.06em] text-rr-primary md:text-lg">
        {children}
      </h2>
      <span
        aria-hidden="true"
        className="mt-2 block h-[3px] w-10 rounded-full bg-rr-green"
      />
    </div>
  );
}

export function OperatorSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-rr-primary">
        {children}
      </p>
      <span
        aria-hidden="true"
        className="mt-1.5 block h-[2px] w-8 rounded-full bg-rr-green"
      />
    </div>
  );
}

export function OperatorSectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-rr-primary">
      {children}
      <span
        aria-hidden="true"
        className="block h-[3px] w-8 rounded-full bg-rr-green"
      />
    </p>
  );
}
