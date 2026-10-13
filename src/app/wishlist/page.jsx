"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "../../components/product/ProductCard";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const { products } = useProducts();
  const saved = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-center text-4xl md:text-5xl">Wishlist</h1>
      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Heart size={36} strokeWidth={1.2} />
          <p className="text-muted">Nothing saved yet. Tap the heart on any piece you love.</p>
          <Link href="/shop" className="btn-dark mt-2">
            Explore the Collection
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-5 lg:grid-cols-4">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
