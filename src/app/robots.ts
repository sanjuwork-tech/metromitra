import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || "https://metromitra.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/profile"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
