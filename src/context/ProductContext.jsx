"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { SEED_PRODUCTS } from "../data/products";

const ProductContext = createContext(null);

// initialProducts comes from the server so the first HTML (what crawlers see) lists the real catalogue.
export function ProductProvider({ initialProducts, children }) {
  const [products, setProducts] = useState(initialProducts?.length ? initialProducts : SEED_PRODUCTS);

  // Live Firestore products replace the seed catalogue once any exist.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onSnapshot(
      collection(db, "products"),
      (snap) => {
        const live = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.isActive !== false);
        if (live.length) setProducts(live);
      },
      (err) => console.error("Products listener error:", err)
    );
  }, []);

  const getProduct = (id) => products.find((p) => p.id === id);

  return <ProductContext.Provider value={{ products, getProduct }}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductProvider");
  return ctx;
}
