import { SITE_URL } from "../lib/config";

export default function robots() {
  const baseUrl = SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/checkout/",
        "/account/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
