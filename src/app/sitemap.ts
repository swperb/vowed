import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vowed.love";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/sign-in", "/sign-up"].map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
