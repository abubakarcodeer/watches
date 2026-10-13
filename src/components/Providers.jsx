"use client";

import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ProductProvider } from "../context/ProductContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export default function Providers({ initialProducts, children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <ProductProvider initialProducts={initialProducts}>
            <CartProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
