import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mivafix.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: ["/dashboard/", "/api/", "/api-docs"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

