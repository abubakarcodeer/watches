import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { IMAGES } from "../../data/images";
import SectionHeader from "./SectionHeader";

const TILES = [
  { label: "Men's Watches", href: "/shop/category/mens", image: IMAGES.categories.mens },
  { label: "Women's Watches", href: "/shop/category/womens", image: IMAGES.categories.womens },
  { label: "Smart Watches", href: "/shop/category/smart", image: IMAGES.categories.smart },
  { label: "Watch Accessories", href: "/shop/category/accessories", image: IMAGES.categories.accessories },
  { label: "Luxury Brands", href: "/shop/collection/luxury", image: IMAGES.categories.luxury },
];

export default function Categories() {
  return (
    <section className="container pt-12 md:pt-14">
      <SectionHeader title="Shop by Category" href="/shop" linkLabel="Explore All" />
      <ul className="no-scrollbar -mx-5 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:px-0">
        {TILES.map((tile) => (
          <li key={tile.label} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <Link href={tile.href} className="group block rounded-2xl bg-sand p-2.5 transition hover:bg-cream">
              <div className="aspect-square overflow-hidden rounded-xl">
                <img src={tile.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-3">
                <span className="text-[13px] font-medium leading-tight">{tile.label}</span>
                <ArrowUpRight size={15} className="shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-deep" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
