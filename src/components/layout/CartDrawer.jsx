"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { lineKey, useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/config";
import { useSettings } from "../../context/SettingsContext";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const { freeShippingThreshold } = useSettings();
  const close = () => setIsCartOpen(false);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const remaining = Math.max(0, Number(freeShippingThreshold) - subtotal);

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={close}>
      <aside
        className="ml-auto flex h-full w-full max-w-[420px] animate-slideIn flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-2xl">Your Cart ({itemCount})</h2>
          <button onClick={close} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={36} strokeWidth={1.2} />
            <p className="text-muted">Your cart is empty.</p>
            <Link href="/shop" onClick={close} className="btn-dark">
              Shop Best Sellers
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-cream px-6 py-3 text-center text-xs">
              {remaining > 0 ? (
                <>Add <b>{formatPrice(remaining)}</b> more for free delivery</>
              ) : (
                <>You have unlocked <b>free delivery</b></>
              )}
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => {
                const key = lineKey(item);
                return (
                  <li key={key} className="flex gap-4 py-5">
                    <Link href={`/product/${item.id}`} onClick={close} className="shrink-0">
                      <img src={item.image} alt={item.title} className="h-24 w-24 rounded-lg bg-sand object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button className="p-2" onClick={() => updateQuantity(key, -1)} aria-label="Decrease quantity">
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button className="p-2" onClick={() => updateQuantity(key, 1)} aria-label="Increase quantity">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(key)} className="text-xs text-muted link-underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line px-6 py-5">
              <div className="mb-1 flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-muted">Delivery charges calculated at checkout.</p>
              <Link href="/checkout" onClick={close} className="btn-dark w-full">
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
