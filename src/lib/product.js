// The four fixed gallery views every product can have, in display order.
export const PRODUCT_VIEWS = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "side", label: "Side" },
  { key: "detail", label: "Close-up" },
];

// Ordered gallery for a product: the four named views first, then any extra images.
// Falls back to `images`/`image` for products saved before views existed.
export function getGallery(product) {
  if (!product) return [];
  const views = product.views || {};
  const gallery = PRODUCT_VIEWS.filter((v) => views[v.key]).map((v) => ({ src: views[v.key], label: v.label }));
  const used = new Set(gallery.map((g) => g.src));

  const extras = (product.images?.length ? product.images : product.image ? [product.image] : [])
    .filter((src) => src && !used.has(src))
    .map((src, i) => ({ src, label: gallery.length ? `Extra ${i + 1}` : `View ${i + 1}` }));

  return [...gallery, ...extras];
}

// Splits long-form text into paragraphs and bullet lists ("- " or "• " lines).
export function parseRichText(text = "") {
  return String(text)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const isList = lines.every((l) => /^[-•*]\s+/.test(l));
      return isList ? { type: "list", items: lines.map((l) => l.replace(/^[-•*]\s+/, "")) } : { type: "paragraph", text: lines.join(" ") };
    });
}

export function isSoldOut(product) {
  return product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;
}

// The next items after `index` in a circular list, so every item gets picked by its predecessors.
function after(list, index, count) {
  return Array.from({ length: Math.min(count, list.length) }, (_, i) => list[(index + 1 + i) % list.length]);
}

// "You May Also Like": same-category products first, topped up from other categories.
// Each product shows the ones that follow it (ordered by id, so server and client agree), which
// spreads internal links across the whole catalogue instead of always pointing at the same few.
export function getRelatedProducts(products, product, limit = 8) {
  const ordered = [...products].sort((a, b) => a.id.localeCompare(b.id));
  const inStock = ordered.filter((p) => p.id === product.id || !isSoldOut(p));

  const pick = (list) => {
    const index = list.findIndex((p) => p.id === product.id);
    return after(list, index, list.length).filter((p) => p.id !== product.id);
  };

  const sameCategory = pick(inStock.filter((p) => p.category === product.category || p.id === product.id));
  const otherCategories = pick(inStock.filter((p) => p.category !== product.category || p.id === product.id));

  return [...sameCategory.slice(0, Math.max(limit - 2, 0)), ...otherCategories].slice(0, limit);
}
