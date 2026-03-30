import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel/", "/api/", "/onboard/", "/login"],
      },
    ],
    sitemap: "https://gh7.ai/sitemap.xml",
  };
}
