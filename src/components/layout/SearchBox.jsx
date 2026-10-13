"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useProducts } from "../../context/ProductContext";
import { formatPrice, productMeta } from "../../lib/config";

export const searchProducts = (products, term, limit = 6) => {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => `${p.title} ${p.brand || ""} ${p.category} ${p.movement || ""}`.toLowerCase().includes(q)).slice(0, limit);
};

// Header search field with live results underneath (desktop); phones use SearchOverlay instead.
export default function SearchBox() {
  const { products } = useProducts();
  const pathname = usePathname();
  const boxRef = useRef(null);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setTerm("");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = searchProducts(products, term);

  return (
    <div ref={boxRef} className="relative w-full max-w-[440px]">
      <label className="flex h-11 items-center gap-3 rounded-full bg-sand px-4 text-sm ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-forest/40">
        <Search size={17} className="shrink-0 text-ink" />
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search for your favorite watch..."
          aria-label="Search watches"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
      </label>

      {open && term.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 animate-fadeUp rounded-2xl border border-line bg-white p-2 shadow-card">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">No watches match “{term}”.</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link href={`/product/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-sand">
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg bg-sand object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.title}</span>
                      <span className="block text-xs text-muted">{productMeta(p)}</span>
                    </span>
                    <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
