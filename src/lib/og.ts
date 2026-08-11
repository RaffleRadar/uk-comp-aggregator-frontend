function resolveImageUrl(image: string | null | undefined, fallbackImage: string): string {
  if (!image) {
    return fallbackImage;
  }

  let parsed: URL;

  try {
    parsed = new URL(image);
  } catch {
    return fallbackImage;
  }

  if (parsed.protocol !== "https:") {
    return fallbackImage;
  }

  return `/api/og-image?src=${encodeURIComponent(image)}`;
}

type BuildOpenGraphArgs = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  fallbackImage?: string;
};

export function buildOpenGraph({
  title,
  description,
  path,
  image,
  fallbackImage = "/og-default.png",
}: BuildOpenGraphArgs) {
  const url = resolveImageUrl(image, fallbackImage);
  return {
    title,
    description,
    url: path,
    siteName: "RaffleRadar",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  };
}

type BuildTwitterArgs = {
  title: string;
  description: string;
  image?: string | null;
  fallbackImage?: string;
};

export function buildTwitter({
  title,
  description,
  image,
  fallbackImage = "/og-default.png",
}: BuildTwitterArgs) {
  const url = resolveImageUrl(image, fallbackImage);
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [url],
  };
}
