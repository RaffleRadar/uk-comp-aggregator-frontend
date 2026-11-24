import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient, urlFor } from "@/sanity/client";
import { OPERATOR_PROFILE_LOGOS } from "@/sanity/queries";

type ProfileLogo = {
  operatorId?: string | null;
  operatorName?: string | null;
  logo?: unknown;
};

export type OperatorLogos = Record<string, string>;

const LOGOS_TTL = 300;

function nameKey(name: string): string {
  return `name:${name.trim().toLowerCase()}`;
}

export async function getOperatorLogos(): Promise<OperatorLogos> {
  let profiles: ProfileLogo[] = [];

  try {
    profiles = await sanityClient.fetch<ProfileLogo[]>(
      OPERATOR_PROFILE_LOGOS,
      {},
      { next: { revalidate: LOGOS_TTL } },
    );
  } catch {
    return {};
  }

  const logos: OperatorLogos = {};

  for (const profile of profiles ?? []) {
    if (!profile.logo) continue;
    let url: string;
    try {
      url = urlFor(profile.logo as SanityImageSource)
        .width(96)
        .height(96)
        .fit("max")
        .auto("format")
        .url();
    } catch {
      continue;
    }
    if (profile.operatorId) logos[profile.operatorId] = url;
    if (profile.operatorName) logos[nameKey(profile.operatorName)] = url;
  }

  return logos;
}

export function findOperatorLogo(
  logos: OperatorLogos,
  operator: { id: string; name: string },
): string | null {
  return logos[operator.id] ?? logos[nameKey(operator.name)] ?? null;
}
