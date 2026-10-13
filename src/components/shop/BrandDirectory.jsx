"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useProducts } from "../../context/ProductContext";
import { BRANDS, slugify } from "../../lib/config";

// The headline brands first, then every other brand found in the catalogue.
export default function BrandDirectory() {
  const { products } = useProducts();

  const others = [...new Set(products.map((p) => p.brand).filter(Boolean))].filter((b) => !BRANDS.includes(b)).sort();
  const brands = [...BRANDS, ...others].map((name) => {
    const items = products.filter((p) => p.brand === name);
    return { name, count: items.length, image: items[0]?.image };
  });

  return (
    <div className="container py-10 md:py-14">
      <div className="rounded-2xl bg-forest px-6 py-10 text-center text-white md:py-12">
        <p className="eyebrow text-gold">Shop by Brand</p>
        <h1 className="mt-2 text-3xl md:text-[40px]">Top Brands</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75">World's most trusted watch brands, all in one place.</p>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {brands.map((brand) => (
          <li key={brand.name}>
            <Link href={`/shop/brand/${slugify(brand.name)}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-3 transition hover:border-forest/30 hover:shadow-card">
              {brand.image ? (
                <img src={brand.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-xl bg-sand object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-sand font-logo text-2xl font-bold text-forest">{brand.name.charAt(0)}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{brand.name}</span>
                <span className="text-xs text-muted">{brand.count} {brand.count === 1 ? "product" : "products"}</span>
              </span>
              <ArrowUpRight size={16} className="shrink-0 text-muted transition group-hover:text-gold-deep" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
