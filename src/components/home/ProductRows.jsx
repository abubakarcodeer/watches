"use client";

import { useProducts } from "../../context/ProductContext";
import { toDate } from "../../lib/admin";
import ProductCard from "../product/ProductCard";
import SectionHeader from "./SectionHeader";

const createdTime = (p) => toDate(p.createdAt)?.getTime() || 0;

export function BestSellers() {
  const { products } = useProducts();
  const picks = (products.some((p) => p.bestseller) ? products.filter((p) => p.bestseller) : products).slice(0, 5);

  return (
    <section className="container pt-12 md:pt-14">
      <SectionHeader title="Best Sellers" subtitle="Most loved watches, handpicked for you." href="/shop" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// Products flagged "New arrival" first, then the most recently added.
export function LatestArrivals() {
  const { products } = useProducts();
  const picks = [...products].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || createdTime(b) - createdTime(a)).slice(0, 4);

  return (
    <section className="container pt-12 md:pt-14">
      <SectionHeader title="Latest Arrivals" href="/shop" />
      <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} compact />
        ))}
      </div>
    </section>
  );
}
