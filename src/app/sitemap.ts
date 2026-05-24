import type { MetadataRoute } from "next";
import { SERVICES_TEASER, SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.VERCEL_ENV !== "production") return [];
  const now = new Date();
  const base = SITE.url.replace(/\/$/, "");

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/why-choose-us", changeFrequency: "monthly", priority: 0.8 },
    { path: "/team", changeFrequency: "monthly", priority: 0.7 },
    { path: "/showcase", changeFrequency: "weekly", priority: 0.8 },
    { path: "/quote", changeFrequency: "monthly", priority: 0.9 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes = SERVICES_TEASER.map((s) => ({
    path: `/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes].map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
