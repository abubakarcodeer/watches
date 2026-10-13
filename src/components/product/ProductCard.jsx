"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, productMeta } from "../../lib/config";
import { isSoldOut } from "../../lib/product";

export function Rating({ rating, reviews, className = "" }) {
  if (!rating) return null;
  return (
    <p className={`flex items-center gap-1 text-xs text-muted ${className}`}>
      <Star size={12} className="fill-gold text-gold" />
      <span className="font-medium text-ink">{Number(rating).toFixed(1)}</span>
      {reviews > 0 && <span>({reviews})</span>}
    </p>
  );
}

// `compact` drops the Add to Cart button (used for the Latest Arrivals row).
export default function ProductCard({ product, compact = false }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);
  const soldOut = isSoldOut(product);
  const onSale = product.compareAtPrice > product.price;
  const meta = productMeta(product);

  return (
    <article className={`group flex h-full flex-col rounded-2xl border border-line bg-white p-2.5 transition hover:border-forest/30 hover:shadow-card ${soldOut ? "opacity-80" : ""}`}>
      <div className="relative overflow-hidden rounded-xl bg-sand">
        <Link href={`/product/${product.id}`} className="block aspect-square">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.05] ${soldOut ? "grayscale-[0.5]" : ""}`}
          />
        </Link>

        {soldOut ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Sold Out</span>
        ) : (
          onSale && (
            <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-gold px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
              -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </span>
          )
        )}

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:text-forest"
        >
          <Heart size={15} className={saved ? "fill-forest text-forest" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3.5">
        <Link href={`/product/${product.id}`} className="text-[13.5px] font-semibold leading-snug transition hover:text-forest">
          {product.title}
        </Link>
        {meta && <p className="mt-1 text-[11.5px] text-muted">{meta}</p>}
        <p className="mt-2.5 text-[15px] font-semibold">
          {formatPrice(product.price)}
          {onSale && <span className="ml-2 text-xs font-normal text-muted line-through">{formatPrice(product.compareAtPrice)}</span>}
        </p>
        <Rating rating={product.rating} reviews={product.reviews} className="mt-1.5" />

        {!compact && (
          <div className="mt-auto pt-3.5">
            <button onClick={() => addItem(product)} disabled={soldOut} className="btn-dark w-full py-2.5 text-xs">
              <span className="sr-only">{product.title}: </span>
              {soldOut ? "Sold Out" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
