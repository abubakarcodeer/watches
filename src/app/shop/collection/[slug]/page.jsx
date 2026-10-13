import ShopView from "../../../../components/shop/ShopView";
import { COLLECTIONS } from "../../../../lib/config";
import { notFound } from "next/navigation";

const find = (slug) => COLLECTIONS.find((c) => c.slug === slug);

export async function generateMetadata(props) {
  const params = await props.params;
  const collection = find(params.slug);

  if (!collection) return { title: "Collection Not Found" };

  return {
    title: `${collection.name} Collection`,
    description: `${collection.tagline}. Explore the ${collection.name.toLowerCase()} watch collection.`,
  };
}

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export default async function CollectionPage(props) {
  const params = await props.params;
  if (!find(params.slug)) notFound();

  return <ShopView collection={params.slug} />;
}
