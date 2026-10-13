"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { parseRichText } from "../../lib/product";

export function RichText({ text, className = "" }) {
  const blocks = parseRichText(text);
  return (
    <div className={`space-y-4 leading-relaxed text-ink/80 ${className}`}>
      {blocks.map((block, i) =>
        block.type === "list" ? (
          <ul key={i} className="space-y-2">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block.text}</p>
        )
      )}
    </div>
  );
}

// Expandable Description / Specifications / Delivery sections; the first one starts open.
export default function ProductDetails({ sections }) {
  const visible = sections.filter((s) => s.text?.trim());
  const [open, setOpen] = useState(visible[0]?.title);

  if (!visible.length) return null;

  return (
    <div className="divide-y divide-line border-y border-line">
      {visible.map((section) => {
        const isOpen = open === section.title;
        return (
          <div key={section.title}>
            <button
              onClick={() => setOpen(isOpen ? null : section.title)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-5 text-left text-lg font-semibold transition hover:text-forest"
            >
              {section.title}
              {isOpen ? <Minus size={18} className="text-forest" /> : <Plus size={18} />}
            </button>
            {isOpen && (
              <div className="animate-fadeUp pb-6">
                <RichText text={section.text} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
