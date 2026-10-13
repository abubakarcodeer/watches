import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "../../data/images";
import { COLLECTIONS } from "../../lib/config";
import SectionHeader from "./SectionHeader";

const TILES = [
  ...COLLECTIONS.map((c) => ({ ...c, href: `/shop/collection/${c.slug}`, image: IMAGES.collections[c.slug] })),
  { slug: "smart", name: "Smart", tagline: "Stay Connected", href: "/shop/category/smart", image: IMAGES.collections.smart },
];

export default function FeaturedCollections() {
  return (
    <section className="container pt-12 md:pt-14">
      <SectionHeader title="Featured Collections" href="/shop" />
      <ul className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
        {TILES.map((tile) => (
          <li key={tile.slug}>
            <Link href={tile.href} className="group block rounded-2xl bg-cream p-2.5 transition hover:shadow-card">
              <div className="aspect-[4/3] overflow-hidden rounded-xl">
                <img src={tile.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-end justify-between gap-2 px-2 pb-1.5 pt-3.5">
                <div>
                  <h3 className="text-[15px] font-semibold">{tile.name}</h3>
                  <p className="mt-0.5 text-[11.5px] text-muted">{tile.tagline}</p>
                </div>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/15 bg-white/60 transition group-hover:border-gold group-hover:bg-gold">
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
