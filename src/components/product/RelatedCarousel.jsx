"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

// One-row product slider. Every card is in the server HTML (crawlers follow all links);
// it only scrolls visually: swipe on touch, arrows or mouse-drag on desktop.
export default function RelatedCarousel({ title, products }) {
  const trackRef = useRef(null);
  const drag = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [products]);

  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth, behavior: "smooth" });

  // Mouse drag; touch and trackpads already scroll natively.
  function onPointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 5) return;
    const el = trackRef.current;
    if (!d.moved) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none"; // snap would fight the drag
    }
    el.scrollLeft = d.left - dx;
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    trackRef.current.style.scrollSnapType = ""; // restoring snap settles on the nearest card
    // Swallow the click that ends a drag so it doesn't open a product (it fires before the timeout).
    const swallow = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
  }

  if (!products.length) return null;

  return (
    <section className="container pb-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        <div className="flex gap-2">
          {[
            { dir: -1, Icon: ChevronLeft, label: "Previous products", disabled: edges.start },
            { dir: 1, Icon: ChevronRight, label: "Next products", disabled: edges.end },
          ].map(({ dir, Icon, label, disabled }) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              disabled={disabled}
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full border border-line transition hover:border-forest hover:bg-forest hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
        className="flex snap-x snap-mandatory gap-x-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:gap-x-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[calc((100%-1rem)/2.2)] shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
