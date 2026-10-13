import { getActiveProducts } from "../lib/server/products";
import { BRANDS, CATEGORIES, COLLECTIONS, SITE_URL, slugify } from "../lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = SITE_URL;
  const products = await getActiveProducts();

  // Listing pages change when the catalogue does. A fresh timestamp on every fetch teaches Google to ignore lastmod.
  const catalogueUpdated = products[0]?.updatedAt || undefined;

  // 1. Static Routes (account/login/register/wishlist are per-user or thin, so they stay out)
  const staticRoutes = [
    { route: "", priority: 1, lastModified: catalogueUpdated },
    { route: "/shop", priority: 0.9, lastModified: catalogueUpdated },
    { route: "/brands", priority: 0.6, lastModified: catalogueUpdated },
    { route: "/contact", priority: 0.4 },
    { route: "/help", priority: 0.4 },
    { route: "/privacy-policy", priority: 0.3 },
  ].map(({ route, priority, lastModified }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));

  // 2. Listing Routes: categories, collections and brands
  const listingRoutes = [
    ...[...CATEGORIES, { slug: "sale" }].map((c) => `/shop/category/${c.slug}`),
    ...COLLECTIONS.map((c) => `/shop/collection/${c.slug}`),
    ...BRANDS.map((b) => `/shop/brand/${slugify(b)}`),
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: catalogueUpdated,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Product Routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt || undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...listingRoutes, ...productRoutes];
}
