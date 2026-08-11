import "@fontsource/inter/latin.css";
import type { Metadata } from "next";
import { CANONICAL_ORIGIN } from "@/lib/site";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { getOgImageUrl } from "@/sanity/queries";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const sanityOgImage = await getOgImageUrl();
  const fallbackImage = sanityOgImage ?? "/og-default.png";

  const title = "RaffleRadar";
  const description = "Find the best UK prize draws in one place.";

  return {
    metadataBase: new URL(CANONICAL_ORIGIN),
    title,
    description,
    openGraph: buildOpenGraph({
      title,
      description,
      path: "/",
      image: sanityOgImage,
      fallbackImage,
    }),
    twitter: buildTwitter({
      title,
      description,
      image: sanityOgImage,
      fallbackImage,
    }),
    icons: {
      icon: "/favnew.svg",
      shortcut: "/favnew.svg",
    },
  };
}

const themeInitScript = `try{const storedTheme=window.localStorage.getItem("theme");const theme=storedTheme==="light"||storedTheme==="dark"?storedTheme:"dark";document.documentElement.classList.toggle("dark",theme==="dark");}catch{document.documentElement.classList.add("dark");}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans dark" suppressHydrationWarning>
      <body>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
