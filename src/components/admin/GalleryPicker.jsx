"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, Search } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { Drawer, Loading } from "./ui";

export default function GalleryPicker({ open, onClose, onSelect }) {
  const { data: products, loading } = useCollection("products");
  const [term, setTerm] = useState("");

  const allImages = useMemo(() => {
    if (!products.length) return [];
    const images = new Set();
    products.forEach((p) => {
      if (p.images) p.images.forEach((img) => img && images.add(img));
      if (p.image) images.add(p.image);
      if (p.views) Object.values(p.views).forEach((img) => img && images.add(img));
    });
    return Array.from(images);
  }, [products]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return allImages;

    const relevantImages = new Set();
    products.forEach(p => {
      if (p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)) {
        if (p.images) p.images.forEach(img => img && relevantImages.add(img));
        if (p.image) relevantImages.add(p.image);
        if (p.views) Object.values(p.views).forEach(img => img && relevantImages.add(img));
      }
    });

    return Array.from(relevantImages);
  }, [allImages, products, term]);

  return (
    <Drawer open={open} onClose={onClose} title="Select from Gallery">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by product or category…"
            className="field pl-10 py-2.5"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <ImageIcon size={40} className="text-line mb-3" />
            <p className="font-semibold">No images found</p>
            <p className="text-sm text-muted">Try another search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => {
                  onSelect(src);
                  onClose();
                }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-sand hover:border-forest transition"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-forest/10 opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
