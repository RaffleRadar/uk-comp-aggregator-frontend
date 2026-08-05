import "@fontsource/inter/latin.css";
import type { Metadata } from "next";
import { CANONICAL_ORIGIN } from "@/lib/site";
import { getOgImageUrl } from "@/sanity/queries";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = (await getOgImageUrl()) ?? "/og-default.png";

  return {
    metadataBase: new URL(CANONICAL_ORIGIN),
    title: "RaffleRadar",
    description: "Find the best UK prize draws in one place.",
    openGraph: {
      siteName: "RaffleRadar",
      locale: "en_GB",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
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
