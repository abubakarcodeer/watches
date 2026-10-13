import ShopView from "../../../../components/shop/ShopView";
import { CATEGORIES } from "../../../../lib/config";
import { notFound } from "next/navigation";

const nameOf = (slug) => (slug === "sale" ? "Deals" : CATEGORIES.find((c) => c.slug === slug)?.name);

export async function generateMetadata(props) {
  const params = await props.params;
  const name = nameOf(params.slug);

  if (!name) return { title: "Category Not Found" };

  return {
    title: name,
    description: `Shop ${name.toLowerCase()} from the world's most trusted watch brands. Authentic pieces, secure payments and easy returns.`,
  };
}

export async function generateStaticParams() {
  return [...CATEGORIES.map((c) => ({ slug: c.slug })), { slug: "sale" }];
}

export default async function CategoryPage(props) {
  const params = await props.params;
  if (!nameOf(params.slug)) notFound();

  return <ShopView category={params.slug} />;
}
