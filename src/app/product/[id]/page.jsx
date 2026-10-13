import { getActiveProducts, getProductById } from "../../../lib/server/products";
import ProductPageClient from "../../../components/product/ProductPageClient";
import { notFound } from "next/navigation";
import { SITE_URL } from "../../../lib/config";
import { isFirebaseConfigured } from "../../../lib/firebase";
import { SEED_PRODUCTS } from "../../../data/products";

export async function generateMetadata(props) {
  const params = await props.params;
  const product = await getProductById(params.id);

  if (!product) return { title: "Product Not Found" };

  const baseUrl = SITE_URL;

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `${baseUrl}/product/${product.id}`,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${baseUrl}/product/${product.id}`,
      images: [{ url: product.image || "/icon.svg" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: [product.image || "/icon.svg"],
    },
  };
}

/**
 * Pre-generate paths for active products at build time.
 * For any new products added, they will be generated on-demand (ISR).
 */
export async function generateStaticParams() {
  const products = await getActiveProducts();
  return (products.length ? products : SEED_PRODUCTS).map((p) => ({ id: p.id }));
}

export default async function Page(props) {
  const params = await props.params;
  const product = await getProductById(params.id);

  if (!product && isFirebaseConfigured) {
    notFound();
  }

  return <ProductPageClient initialProduct={product} />;
}
