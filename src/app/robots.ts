import type { MetadataRoute } from "next";
import { CANONICAL_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/studio",
          "/oauth/",
          "/profile",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/maintenance",
          "/newsletter/confirm",
          "/newsletter/unsubscribe",
          "/saved-searches/unsubscribe",
        ],
      },
    ],
    host: CANONICAL_ORIGIN,
  };
}
