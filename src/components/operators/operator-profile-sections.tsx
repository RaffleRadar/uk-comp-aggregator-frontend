import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/sanity/portableTextComponents";
import type { OperatorProfile } from "@/types/operator-profile";
import {
  formatDrawMethods,
  formatPaymentMethods,
  yesNo,
} from "@/types/operator-profile";

type OperatorProfileSectionsProps = {
  profile: OperatorProfile | null;
  operatorName: string;
};

export function OperatorProfileSections({
  profile,
  operatorName,
}: OperatorProfileSectionsProps) {
  if (!profile) return null;

  const hasCompanyDetails =
    !!profile.registeredCompanyName ||
    !!profile.companiesHouseNumber ||
    !!profile.foundedYear ||
    !!profile.location;

  const drawMethodLabel = formatDrawMethods(profile.drawMethod).join(", ");
  const paymentMethodsLabel = formatPaymentMethods(profile.paymentMethods).join(", ");

  const hasHowTheyRunIt =
    !!drawMethodLabel ||
    !!profile.drawSchedule?.length ||
    !!profile.freeEntryUrl ||
    profile.postalFreeEntry !== null && profile.postalFreeEntry !== undefined ||
    !!paymentMethodsLabel ||
    !!profile.prizeDelivery ||
    !!profile.voluntaryCodeMembership ||
    !!profile.responsiblePlayControls?.length ||
    profile.publicEntryLists !== null && profile.publicEntryLists !== undefined ||
    profile.winnersPublished !== null && profile.winnersPublished !== undefined;

  const hasPros = Array.isArray(profile.pros) && profile.pros.length > 0;
  const hasCons = Array.isArray(profile.cons) && profile.cons.length > 0;
  const hasProsCons = hasPros || hasCons;
  const hasBestFor = !!profile.bestFor;

  const hasFullProfile =
    Array.isArray(profile.fullProfile) && profile.fullProfile.length > 0;

  const hasTrustpilot =
    !!profile.trustpilotUrl ||
    (typeof profile.trustpilotScore === "number");
  const hasSocial =
    !!profile.facebookUrl ||
    !!profile.instagramUrl ||
    !!profile.tiktokUrl ||
    !!profile.youtubeUrl ||
    !!profile.supportEmail;
  const hasElsewhere = hasTrustpilot || hasSocial;

  if (
    !hasCompanyDetails &&
    !hasHowTheyRunIt &&
    !hasProsCons &&
    !hasFullProfile &&
    !hasElsewhere
  ) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {hasCompanyDetails ? (
        <section className="rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
            Company details
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {profile.registeredCompanyName ? (
              <>
                <dt className="text-sm text-rr-muted">Registered company name</dt>
                <dd className="text-sm text-rr-primary">
                  {profile.registeredCompanyName}
                </dd>
              </>
            ) : null}
            {profile.companiesHouseNumber ? (
              <>
                <dt className="text-sm text-rr-muted">Companies House number</dt>
                <dd className="text-sm text-rr-primary">
                  <Link
                    href={`https://find-and-update.company-information.service.gov.uk/company/${profile.companiesHouseNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rr-green no-underline hover:underline"
                  >
                    {profile.companiesHouseNumber}
                  </Link>
                </dd>
              </>
            ) : null}
            {profile.foundedYear ? (
              <>
                <dt className="text-sm text-rr-muted">Founded</dt>
                <dd className="text-sm text-rr-primary">{profile.foundedYear}</dd>
              </>
            ) : null}
            {profile.location ? (
              <>
                <dt className="text-sm text-rr-muted">Location</dt>
                <dd className="text-sm text-rr-primary">{profile.location}</dd>
              </>
            ) : null}
          </dl>
        </section>
      ) : null}

      {hasHowTheyRunIt ? (
        <section className="rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
            How they run it
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {drawMethodLabel ? (
              <>
                <dt className="text-sm text-rr-muted">Draw method</dt>
                <dd className="text-sm text-rr-primary">{drawMethodLabel}</dd>
              </>
            ) : null}
            {profile.drawSchedule?.length ? (
              <>
                <dt className="text-sm text-rr-muted">Draw schedule</dt>
                <dd className="text-sm text-rr-primary">
                  <ul>
                    {profile.drawSchedule.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </dd>
              </>
            ) : null}
            {profile.freeEntryUrl ? (
              <>
                <dt className="text-sm text-rr-muted">Free entry</dt>
                <dd className="text-sm text-rr-primary">
                  <Link
                    href={profile.freeEntryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rr-green no-underline hover:underline"
                  >
                    Free entry route and terms
                  </Link>
                </dd>
              </>
            ) : null}
            {profile.postalFreeEntry !== null &&
            profile.postalFreeEntry !== undefined ? (
              <>
                <dt className="text-sm text-rr-muted">Postal free entry</dt>
                <dd className="text-sm text-rr-primary">
                  {yesNo(profile.postalFreeEntry)}
                </dd>
              </>
            ) : null}
            {paymentMethodsLabel ? (
              <>
                <dt className="text-sm text-rr-muted">Payment methods</dt>
                <dd className="text-sm text-rr-primary">{paymentMethodsLabel}</dd>
              </>
            ) : null}
            {profile.prizeDelivery ? (
              <>
                <dt className="text-sm text-rr-muted">Prize delivery</dt>
                <dd className="text-sm text-rr-primary">{profile.prizeDelivery}</dd>
              </>
            ) : null}
            {profile.voluntaryCodeMembership ? (
              <>
                <dt className="text-sm text-rr-muted">Voluntary code</dt>
                <dd className="text-sm text-rr-primary">
                  {profile.voluntaryCodeMembership}
                </dd>
              </>
            ) : null}
            {profile.responsiblePlayControls?.length ? (
              <>
                <dt className="text-sm text-rr-muted">Responsible play controls</dt>
                <dd className="text-sm text-rr-primary">
                  <ul>
                    {profile.responsiblePlayControls.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </dd>
              </>
            ) : null}
            {profile.publicEntryLists !== null &&
            profile.publicEntryLists !== undefined ? (
              <>
                <dt className="text-sm text-rr-muted">Public entry lists</dt>
                <dd className="text-sm text-rr-primary">
                  {yesNo(profile.publicEntryLists)}
                </dd>
              </>
            ) : null}
            {profile.winnersPublished !== null &&
            profile.winnersPublished !== undefined ? (
              <>
                <dt className="text-sm text-rr-muted">Winners published</dt>
                <dd className="text-sm text-rr-primary">
                  {yesNo(profile.winnersPublished)}
                </dd>
              </>
            ) : null}
          </dl>
        </section>
      ) : null}

      {hasProsCons ? (
        <section className="rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
            Pros and cons
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            {hasPros ? (
              <div>
                <h3 className="text-sm font-medium text-rr-primary">Pros</h3>
                <ul className="mt-3 space-y-2">
                  {profile.pros!.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm leading-6 text-rr-secondary"
                    >
                      <span className="text-rr-green">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {hasCons ? (
              <div>
                <h3 className="text-sm font-medium text-rr-primary">Cons</h3>
                <ul className="mt-3 space-y-2">
                  {profile.cons!.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm leading-6 text-rr-secondary"
                    >
                      <span className="text-rr-secondary">−</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {hasBestFor ? (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.14em] text-rr-muted">
                Best for
              </p>
              <p className="mt-1 text-sm text-rr-primary">{profile.bestFor}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {hasFullProfile ? (
        <section className="rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
            About {operatorName}
          </h2>
          <div className="mt-4">
            <PortableText
              value={profile.fullProfile!}
              components={portableTextComponents}
            />
          </div>
        </section>
      ) : null}

      {hasElsewhere ? (
        <section className="rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
            Elsewhere on the web
          </h2>
          <div className="mt-4 space-y-4">
            {hasTrustpilot ? (
              <div>
                {profile.trustpilotUrl &&
                typeof profile.trustpilotScore === "number" ? (
                  <Link
                    href={profile.trustpilotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rr-green no-underline hover:underline text-sm"
                  >
                    Trustpilot {profile.trustpilotScore.toFixed(1)} / 5
                  </Link>
                ) : profile.trustpilotUrl ? (
                  <Link
                    href={profile.trustpilotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rr-green no-underline hover:underline text-sm"
                  >
                    Trustpilot
                  </Link>
                ) : typeof profile.trustpilotScore === "number" ? (
                  <p className="text-sm text-rr-primary">
                    Trustpilot {profile.trustpilotScore.toFixed(1)} / 5
                  </p>
                ) : null}
              </div>
            ) : null}
            {hasSocial ? (
              <div className="flex flex-wrap items-center gap-2">
                {profile.facebookUrl ? (
                  <Link
                    href={profile.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-rr-border bg-rr-elevated px-3 text-sm font-medium text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                  >
                    Facebook
                  </Link>
                ) : null}
                {profile.instagramUrl ? (
                  <Link
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-rr-border bg-rr-elevated px-3 text-sm font-medium text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                  >
                    Instagram
                  </Link>
                ) : null}
                {profile.tiktokUrl ? (
                  <Link
                    href={profile.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-rr-border bg-rr-elevated px-3 text-sm font-medium text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                  >
                    TikTok
                  </Link>
                ) : null}
                {profile.youtubeUrl ? (
                  <Link
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-rr-border bg-rr-elevated px-3 text-sm font-medium text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                  >
                    YouTube
                  </Link>
                ) : null}
                {profile.supportEmail ? (
                  <Link
                    href={`mailto:${profile.supportEmail}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-rr-border bg-rr-elevated px-3 text-sm font-medium text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                  >
                    {profile.supportEmail}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
