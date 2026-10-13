"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);
  const trackRef = useRef(null);
  const count = images.length;

  // Keep the mobile swipe track in sync when a thumbnail or arrow changes the slide.
  useEffect(() => {
    const track = trackRef.current;
    if (track && Math.round(track.scrollLeft / track.clientWidth) !== active) {
      track.scrollTo({ left: active * track.clientWidth, behavior: "smooth" });
    }
  }, [active]);

  const go = (index) => setActive((index + count) % count);

  if (!count) return <div className="aspect-square bg-sand" />;

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 md:flex-row md:gap-4">
      {count > 1 && (
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 md:w-[84px] md:pb-0 md:shrink-0 md:flex-col md:overflow-visible" role="tablist" aria-label="Product views">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              role="tab"
              aria-selected={i === active}
              aria-label={`${img.label} view`}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={`group relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-lg bg-sand ring-offset-2 transition md:w-full ${
                i === active ? "ring-2 ring-forest" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 bg-white/85 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wider text-ink">
                {img.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        {/* Mobile: native swipe with scroll-snap */}
        <div
          ref={trackRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div key={img.src + i} className="aspect-square w-full shrink-0 snap-center bg-sand">
              <img src={img.src} alt={`${title}, ${img.label} view`} className="h-full w-full object-cover" loading={i ? "lazy" : "eager"} />
            </div>
          ))}
        </div>

        {/* Desktop: hover to zoom into the dial */}
        <div
          className="relative hidden aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-sand md:block"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
        >
          {images.map((img, i) => (
            <img
              key={img.src + i}
              src={img.src}
              alt={`${title}, ${img.label} view`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-0"}`}
              style={i === active && zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:bg-forest hover:text-white md:grid"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:bg-forest hover:text-white md:grid"
            >
              <ChevronRight size={20} />
            </button>
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold">
              {images[active]?.label} · {active + 1}/{count}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
