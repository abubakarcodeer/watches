"use client";

import { createContext, useCallback, useContext } from "react";
import { useToast } from "./ToastContext";
import { usePersistedList } from "./usePersistedList";

const WishlistContext = createContext(null);

export const useWishlist = () => useContext(WishlistContext);

const mergeIds = (remote, local) => [...new Set([...remote, ...local])];

export function WishlistProvider({ children }) {
  const { addToast } = useToast();
  // Stores product ids only; details come from ProductContext.
  const [ids, setIds] = usePersistedList("watchshop-wishlist", "wishlist", mergeIds);

  const isInWishlist = useCallback((id) => ids.includes(id), [ids]);

  const toggleWishlist = useCallback(
    (product) => {
      const exists = ids.includes(product.id);
      setIds((current) => (exists ? current.filter((i) => i !== product.id) : [...current, product.id]));
      addToast(exists ? `${product.title} removed from wishlist` : `${product.title} saved to wishlist`);
    },
    [ids, setIds, addToast]
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds: ids, wishlistCount: ids.length, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
