"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WhatsAppButton from "./WhatsAppButton";
import * as fbq from "../../lib/fpixel";

// The admin dashboard has its own shell, so the storefront header, cart and footer are skipped there.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // The pixel snippet in layout.jsx only fires PageView on a full page load; client-side route changes need their own.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!isAdmin) fbq.pageview();
  }, [pathname, isAdmin]);

  if (isAdmin) return children;

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
