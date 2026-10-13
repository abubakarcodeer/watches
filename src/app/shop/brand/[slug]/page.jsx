import ShopView from "../../../../components/shop/ShopView";
import { BRANDS, slugify } from "../../../../lib/config";

// Brands are free text on a product, so any slug is valid: unknown ones simply list no products.
export async function generateMetadata(props) {
  const params = await props.params;
  const name = BRANDS.find((b) => slugify(b) === params.slug) || params.slug.replace(/-/g, " ");

  return {
    title: `${name.replace(/\b\w/g, (c) => c.toUpperCase())} Watches`,
    description: `Shop authentic ${name} watches with warranty, secure payments and easy returns.`,
  };
}

export async function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: slugify(b) }));
}

export default async function BrandPage(props) {
  const params = await props.params;
  return <ShopView brand={params.slug} />;
}
