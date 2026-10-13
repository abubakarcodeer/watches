"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useProducts } from "../../context/ProductContext";
import { formatPrice } from "../../lib/config";
import { searchProducts } from "./SearchBox";

export default function SearchOverlay({ open, onClose }) {
  const { products } = useProducts();
  const [term, setTerm] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTerm("");
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => searchProducts(products, term), [term, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <div className="animate-fadeUp bg-white pb-8 pt-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <div className="flex items-center gap-4 border-b border-forest pb-3">
            <Search size={20} />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search for your favorite watch…"
              className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted/60"
            />
            <button onClick={onClose} aria-label="Close search">
              <X size={22} />
            </button>
          </div>

          {term && (
            <div className="mt-6">
              {results.length === 0 ? (
                <p className="text-sm text-muted">No watches match “{term}”.</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.id}`} onClick={onClose} className="group flex items-center gap-4">
                        <img src={p.image} alt="" className="h-14 w-14 rounded-lg bg-sand object-cover" />
                        <div>
                          <p className="text-sm font-medium group-hover:underline">{p.title}</p>
                          <p className="text-sm text-muted">{formatPrice(p.price)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
