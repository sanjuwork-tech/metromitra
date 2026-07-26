// Static sitemap generated from the static stations reference data (no backend).
import type { MetadataRoute } from "next";
import { STATIONS } from "@/lib/stations-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://metromitra.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/stations`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/carpools`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/ideas`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/lost-found`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/marketplace`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
  const stationRoutes: MetadataRoute.Sitemap = STATIONS.map((s) => ({
    url: `${BASE}/stations/${s.code}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  return [...staticRoutes, ...stationRoutes];
}
