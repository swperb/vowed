import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vowed.love";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authed app areas and guest-specific RSVP pages out of search results
      disallow: ["/dashboard", "/guests", "/budget", "/checklist", "/onboarding", "/rsvp/", "/api/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
