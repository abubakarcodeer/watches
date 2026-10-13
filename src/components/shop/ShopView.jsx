"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "../../components/product/ProductCard";
import { CATEGORIES, COLLECTIONS, slugify } from "../../lib/config";

const FILTERS = [{ slug: "", name: "All" }, ...CATEGORIES, { slug: "sale", name: "Deals" }];

const SORTS = {
  featured: { label: "Featured", fn: (a, b) => Number(!!b.bestseller) - Number(!!a.bestseller) },
  "price-asc": { label: "Price: Low to High", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: High to Low", fn: (a, b) => b.price - a.price },
  rating: { label: "Top Rated", fn: (a, b) => (b.rating || 0) - (a.rating || 0) },
  name: { label: "Name", fn: (a, b) => a.title.localeCompare(b.title) },
};

// One listing page for /shop, a category, a collection ("luxury") or a brand ("rolex").
export default function ShopView({ category = "", collection = "", brand = "" }) {
  const { products } = useProducts();
  const [sort, setSort] = useState("featured");

  const visible = useMemo(() => {
    const list = products.filter((p) => {
      if (brand) return slugify(p.brand) === brand;
      if (collection) return p.collection === collection;
      if (!category) return true;
      if (category === "sale") return p.compareAtPrice > p.price;
      return p.category === category;
    });
    return [...list].sort(SORTS[sort].fn);
  }, [products, category, collection, brand, sort]);

  const brandName = brand && (products.find((p) => slugify(p.brand) === brand)?.brand || brand.replace(/-/g, " "));
  const collectionInfo = COLLECTIONS.find((c) => c.slug === collection);
  const heading = brandName
    ? `${brandName} Watches`
    : collectionInfo
      ? `${collectionInfo.name} Collection`
      : category === "sale"
        ? "Deals"
        : FILTERS.find((f) => f.slug === category)?.name || "All";
  const eyebrow = brandName ? "Brand" : collectionInfo ? collectionInfo.tagline : "Shop";

  return (
    <div className="container py-10 md:py-14">
      <div className="rounded-2xl bg-forest px-6 py-10 text-center text-white md:py-12">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-2 text-3xl capitalize md:text-[40px]">{heading === "All" ? "All Watches" : heading}</h1>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-5 border-b border-line pb-5 md:flex-row">
        <div className="flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const active = !brand && !collection && f.slug === category;
            return (
              <Link
                key={f.slug || "all"}
                href={f.slug ? `/shop/category/${f.slug}` : "/shop"}
                className={`rounded-full border px-4 py-1.5 text-[13px] transition ${
                  active ? "border-forest bg-forest text-white" : "border-line hover:border-forest hover:text-forest"
                }`}
              >
                {f.name}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">{visible.length} {visible.length === 1 ? "product" : "products"}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-forest">
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-center text-muted">No products here yet. Check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
