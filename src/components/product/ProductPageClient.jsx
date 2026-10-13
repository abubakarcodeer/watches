"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Heart, Minus, Plus, RotateCcw, Truck } from "lucide-react";
import { useProducts } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import RelatedCarousel from "./RelatedCarousel";
import ProductGallery from "./ProductGallery";
import ProductDetails from "./ProductDetails";
import { Rating } from "./ProductCard";
import { categoryName, CURRENCY, formatPrice, productMeta, SITE_URL, slugify, STORE_NAME } from "../../lib/config";
import { getGallery, getRelatedProducts, isSoldOut } from "../../lib/product";
import { useSettings } from "../../context/SettingsContext";
import * as fbq from "../../lib/fpixel";

export default function ProductPageClient({ initialProduct }) {
  const { products, getProduct } = useProducts();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { freeShippingThreshold, deliveryTime } = useSettings();

  // initialProduct is the full server copy. The context copy starts card-sized (no descriptions) and
  // becomes the live Firestore document once the listener loads, so it wins wherever it has a value.
  const listed = getProduct(initialProduct?.id);
  const product = initialProduct && listed ? { ...initialProduct, ...listed } : listed || initialProduct;

  // Keyed on the id: the product object is replaced when the live catalogue loads, which would fire ViewContent twice.
  useEffect(() => {
    if (!product) return;
    fbq.event('ViewContent', {
      content_name: product.title,
      content_category: product.category,
      content_ids: [product.id],
      content_type: 'product',
      value: Number(product.price),
      currency: fbq.CURRENCY,
    });
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return (
      <div className="container py-32 text-center">
        <h1 className="text-4xl">Product not found</h1>
        <Link href="/shop" className="btn-dark mt-8">
          Back to Shop
        </Link>
      </div>
    );
  }

  const gallery = getGallery(product);
  const detailSections = [
    { title: "Description", text: product.longDescription || product.description },
    { title: "Specifications", text: product.specs },
    {
      title: "Delivery & Returns",
      text: `- Delivery in ${deliveryTime}
- Free delivery on orders over ${formatPrice(Number(freeShippingThreshold))}
- Insured shipping with signature on delivery
- 7-day easy returns on unworn watches with box and papers
- 2-year warranty on every watch`,
    },
  ];
  const activeColor = color || product.colors?.[0]?.name;
  const related = getRelatedProducts(products, product);
  const meta = productMeta(product);

  const soldOut = isSoldOut(product);
  const onSale = product.compareAtPrice > product.price;

  function handleAdd() {
    if (soldOut) return;
    if (product.sizes?.length && !size) return setSizeError(true);
    addItem(product, { size, color: activeColor, quantity });

    fbq.event('AddToCart', {
      content_name: product.title,
      content_category: product.category,
      content_ids: [product.id],
      content_type: 'product',
      value: Number(product.price) * quantity,
      currency: fbq.CURRENCY,
    });
  }

  // Schema.org JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": gallery.map(img => img.src),
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand || STORE_NAME
    },
    ...(product.rating && product.reviews
      ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": product.rating, "reviewCount": product.reviews } }
      : {}),
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/product/${product.id}`,
      "priceCurrency": CURRENCY,
      "price": product.price,
      "availability": soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container grid gap-8 py-8 md:grid-cols-[1.1fr_1fr] md:gap-14 md:py-12">
        <div className="min-w-0 md:sticky md:top-28 md:self-start">
          <ProductGallery key={product.id} images={gallery} title={product.title} />
        </div>

        <div className="min-w-0">
          <nav className="text-xs text-muted" aria-label="Breadcrumb">
            <Link href="/shop" className="hover:text-ink">Shop</Link> /{" "}
            <Link href={`/shop/category/${product.category}`} className="hover:text-ink">{categoryName(product.category)}</Link>
          </nav>
          {product.brand && (
            <Link href={`/shop/brand/${slugify(product.brand)}`} className="eyebrow mt-5 inline-block text-gold-deep hover:text-forest">
              {product.brand}
            </Link>
          )}
          <h1 className="mt-2 text-3xl leading-tight md:text-[40px]">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            {meta && <p className="text-sm text-muted">{meta}</p>}
            <Rating rating={product.rating} reviews={product.reviews} className="text-[13px]" />
          </div>
          <p className="mt-5 flex items-center gap-3 text-2xl font-semibold">
            {formatPrice(product.price)}
            {onSale && <span className="text-base font-normal text-muted line-through">{formatPrice(product.compareAtPrice)}</span>}
            {onSale && (
              <span className="rounded-md bg-gold px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">
                Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            )}
          </p>
          <p className="mt-5 leading-relaxed text-ink/80">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mt-8">
              <p className="text-sm">
                Colour: <span className="font-semibold">{activeColor}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={activeColor === c.name}
                    className={`h-8 w-8 rounded-full border p-0.5 ${activeColor === c.name ? "border-forest" : "border-transparent"}`}
                  >
                    <span className="block h-full w-full rounded-full border border-black/10" style={{ background: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <p className="text-sm">
                Size {sizeError && <span className="ml-2 text-red-600">Please select a size</span>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                    aria-pressed={size === s}
                    className={`min-w-[60px] rounded-lg border px-3 py-2.5 text-sm transition ${
                      size === s ? "border-forest bg-forest text-white" : "border-line hover:border-forest"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <div className="flex items-center rounded-lg border border-line">
              <button className="px-3 py-3" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button className="px-3 py-3" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
            <button onClick={handleAdd} disabled={soldOut} className="btn-dark flex-1">
              {soldOut ? "Sold Out" : "Add to Cart"}
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="grid w-12 place-items-center rounded-lg border border-line hover:border-forest"
              aria-label="Toggle wishlist"
            >
              <Heart size={18} className={isInWishlist(product.id) ? "fill-forest text-forest" : ""} />
            </button>
          </div>

          <ul className="mt-8 space-y-3 rounded-2xl bg-sand p-5 text-sm text-ink/80">
            <li className="flex items-center gap-3">
              <Truck size={18} strokeWidth={1.5} className="shrink-0 text-forest" /> Free delivery over {formatPrice(Number(freeShippingThreshold))} · {deliveryTime}
            </li>
            <li className="flex items-center gap-3">
              <BadgeCheck size={18} strokeWidth={1.5} className="shrink-0 text-forest" /> 100% authentic with box, papers and 2-year warranty
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw size={18} strokeWidth={1.5} className="shrink-0 text-forest" /> 7-day easy returns on unworn watches
            </li>
          </ul>

          <div className="mt-10">
            <ProductDetails key={product.id} sections={detailSections} />
          </div>
        </div>
      </div>

      <RelatedCarousel title="You May Also Like" products={related} />
    </>
  );
}
