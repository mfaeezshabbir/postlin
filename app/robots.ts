import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://postlin.mfaeezshabbir.me"; // Update with your actual domain

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
