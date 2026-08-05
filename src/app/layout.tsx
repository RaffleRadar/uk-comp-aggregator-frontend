import "@fontsource/inter/latin.css";
import type { Metadata } from "next";
import { CANONICAL_ORIGIN } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: "RaffleRadar",
  description: "Find the best UK prize draws in one place.",
  icons: {
    icon: "/favnew.svg",
    shortcut: "/favnew.svg",
  },
};

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
