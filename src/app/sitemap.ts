// Dynamic sitemap from the seeded stations.
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stations = await db.station.findMany({ select: { code: true, createdAt: true } });
  const base = process.env.NEXTAUTH_URL || "https://metromitra.vercel.app";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/stations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
  const stationRoutes: MetadataRoute.Sitemap = stations.map((s) => ({
    url: `${base}/stations/${s.code}`,
    lastModified: s.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...staticRoutes, ...stationRoutes];
}
