"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { db } from "../../lib/firebase";
import { uploadImage } from "../../lib/uploadImage";
import { BRANDS, CATEGORIES, COLLECTIONS, CURRENCY_SYMBOL, LOW_STOCK_THRESHOLD, MOVEMENTS } from "../../lib/config";
import { CASE_SIZES, STRAP_SIZES } from "../../data/products";
import { PRODUCT_VIEWS } from "../../lib/product";
import { RichText } from "../product/ProductDetails";
import { useToast } from "../../context/ToastContext";
import { Card, Field, PageHeader, Toggle } from "./ui";
import GalleryPicker from "./GalleryPicker";
import ImageCropper from "./ImageCropper";

const EMPTY = {
  title: "",
  brand: "",
  category: "mens",
  collection: "",
  movement: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  description: "",
  longDescription: "",
  specs: "",
  rating: "",
  reviews: "",
  views: { front: "", back: "", side: "", detail: "" },
  extraImages: [],
  sizes: [],
  colors: [],
  bestseller: false,
  isNew: false,
  isActive: true,
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

function fromProduct(product) {
  if (!product) return EMPTY;
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  // Older products only have `images`: map the first four onto the named views.
  const views = product.views
    ? { ...EMPTY.views, ...product.views }
    : Object.fromEntries(PRODUCT_VIEWS.map((v, i) => [v.key, images[i] || ""]));
  const used = new Set(Object.values(views).filter(Boolean));
  return {
    ...EMPTY,
    ...product,
    price: product.price ?? "",
    compareAtPrice: product.compareAtPrice ?? "",
    stock: product.stock ?? "",
    longDescription: product.longDescription || "",
    specs: product.specs || "",
    brand: product.brand || "",
    collection: product.collection || "",
    movement: product.movement || "",
    rating: product.rating ?? "",
    reviews: product.reviews ?? "",
    views,
    extraImages: images.filter((src) => !used.has(src)),
    sizes: product.sizes || [],
    colors: product.colors || [],
  };
}

function ViewSlot({ label, hint, src, busy, onFile, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
        }}
        className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg text-center text-xs transition ${
          src ? "border border-line bg-sand" : "border-2 border-dashed border-forest-soft bg-cream/40 text-muted hover:border-forest hover:text-forest"
        }`}
      >
        {src ? (
          <>
            <img src={src} alt={`${label} view`} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/40 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
              Replace
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow"
              aria-label={`Remove ${label} image`}
            >
              <X size={13} />
            </button>
          </>
        ) : busy ? (
          <Loader2 size={22} className="animate-spin text-forest" />
        ) : (
          <>
            <ImagePlus size={22} />
            <span className="px-2">{hint}</span>
          </>
        )}
        {src && busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 size={22} className="animate-spin text-forest" />
          </span>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.1em]">
        {label} {label === "Front" && <span className="text-forest">*</span>}
      </p>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}

const VIEW_HINTS = {
  front: "Main photo, dial facing camera",
  back: "Case back",
  side: "Side profile",
  detail: "Dial or clasp close-up",
};

export default function ProductForm({ product }) {
  const router = useRouter();
  const { addToast } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => fromProduct(product));
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [urlTarget, setUrlTarget] = useState("front");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [cropState, setCropState] = useState({ open: false, image: null, target: null });
  const [slotBusy, setSlotBusy] = useState({});
  const [descTab, setDescTab] = useState("write");
  const [customSize, setCustomSize] = useState("");
  const [color, setColor] = useState({ name: "", hex: "#0F3B2E" });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setView = (key, src) => setForm((f) => ({ ...f, views: { ...f.views, [key]: src } }));
  const isEdit = Boolean(product);

  async function uploadToView(key, file) {
    if (!file.type.startsWith("image/")) return addToast("Please choose an image file", "error");

    const reader = new FileReader();
    reader.onload = () => {
      setCropState({ open: true, image: reader.result, target: key });
    };
    reader.readAsDataURL(file);
  }

  async function handleCropComplete(blob) {
    const key = cropState.target;
    setCropState({ open: false, image: null, target: null });

    if (key === "extra") {
      setUploading((n) => n + 1);
      try {
        const url = await uploadImage(blob);
        setForm((f) => ({ ...f, extraImages: [...f.extraImages, url] }));
      } catch (err) {
        addToast(`Upload failed: ${err.message}`, "error");
      } finally {
        setUploading((n) => n - 1);
      }
      return;
    }

    setSlotBusy((b) => ({ ...b, [key]: true }));
    try {
      setView(key, await uploadImage(blob));
    } catch (err) {
      addToast(`Upload failed: ${err.message}`, "error");
    } finally {
      setSlotBusy((b) => ({ ...b, [key]: false }));
    }
  }

  async function handleFiles(files) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    // For simplicity, we only crop the first extra image if multiple are dropped,
    // or we could loop. Let's just upload them directly if there are many,
    // or just crop the one being added.
    if (list.length === 1) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropState({ open: true, image: reader.result, target: "extra" });
      };
      reader.readAsDataURL(list[0]);
      return;
    }

    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const url = await uploadImage(file);
          setForm((f) => ({ ...f, extraImages: [...f.extraImages, url] }));
        } catch (err) {
          addToast(`${file.name}: ${err.message}`, "error", 5000);
        } finally {
          setUploading((n) => n - 1);
        }
      })
    );
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!/^https?:\/\//.test(url)) return addToast("Enter a full image URL starting with https://", "error");
    addFromSource(url, urlTarget);
    setImageUrl("");
  }

  function addFromSource(url, target) {
    if (target === "extra") set("extraImages", [...form.extraImages, url]);
    else setView(target, url);
  }

  const viewCount = PRODUCT_VIEWS.filter((v) => form.views[v.key]).length;
  const anySlotBusy = Object.values(slotBusy).some(Boolean);

  const toggleSize = (size) => set("sizes", form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);

  function addColor() {
    if (!color.name.trim()) return;
    set("colors", [...form.colors, { name: color.name.trim(), hex: color.hex }]);
    setColor({ name: "", hex: color.hex });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.title.trim()) return addToast("Add a product name", "error");
    if (!(price > 0)) return addToast("Price must be greater than 0", "error");
    if (!form.views.front) return addToast("Add a front view image", "error");

    const views = Object.fromEntries(PRODUCT_VIEWS.map((v) => [v.key, form.views[v.key] || null]));
    const images = [...PRODUCT_VIEWS.map((v) => form.views[v.key]), ...form.extraImages].filter(Boolean);

    setSaving(true);
    const id = product?.id || `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const compareAtPrice = Number(form.compareAtPrice);
    const rating = Math.min(5, Math.max(0, Number(form.rating) || 0));
    const data = {
      id,
      title: form.title.trim(),
      brand: form.brand.trim(),
      category: form.category,
      collection: form.collection || null,
      movement: form.movement || null,
      price,
      compareAtPrice: compareAtPrice > price ? compareAtPrice : null,
      stock: form.stock === "" ? null : Math.max(0, Math.floor(Number(form.stock))),
      description: form.description.trim(),
      longDescription: form.longDescription.trim(),
      specs: form.specs.trim(),
      rating: rating || null,
      reviews: rating ? Math.max(0, Math.floor(Number(form.reviews) || 0)) : null,
      views,
      image: views.front,
      images,
      sizes: form.sizes,
      colors: form.colors,
      bestseller: form.bestseller,
      isNew: form.isNew,
      isActive: form.isActive,
      updatedAt: serverTimestamp(),
      ...(isEdit ? {} : { createdAt: serverTimestamp() }),
    };

    try {
      await setDoc(doc(db, "products", id), data, { merge: true });

      // Trigger on-demand ISR revalidation
      try {
        const { revalidateProduct } = await import("../../lib/server/actions");
        await revalidateProduct(id);
      } catch (revalErr) {
        console.warn("Revalidation skipped:", revalErr);
      }

      addToast(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      addToast("Could not save the product", "error");
      setSaving(false);
    }
  }

  const sizePresets = form.category === "accessories" ? STRAP_SIZES : CASE_SIZES;
  const extraSizes = form.sizes.filter((s) => !sizePresets.includes(s));

  return (
    <form onSubmit={handleSubmit}>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-forest">
        <ArrowLeft size={15} /> Products
      </Link>
      <PageHeader
        title={isEdit ? "Edit product" : "New product"}
        subtitle={isEdit ? form.title : "Add a new watch to the catalogue"}
        actions={
          <>
            {isEdit && (
              <Link href={`/product/${product.id}`} target="_blank" className="btn-outline bg-white py-2.5">
                View in store
              </Link>
            )}
            <button disabled={saving || uploading > 0 || anySlotBusy} className="btn-dark py-2.5">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <Field label="Product name">
              <input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Seiko Prospex Diver" required />
            </Field>
            <Field label="Short description" hint="One or two sentences shown next to the price">
              <textarea
                className="field min-h-[80px]"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="A professional dive watch with a unidirectional bezel…"
              />
            </Field>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Long description</span>
                <div className="flex rounded-full border border-line p-0.5 text-xs">
                  {["write", "preview"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDescTab(tab)}
                      className={`rounded-full px-3 py-1 capitalize ${descTab === tab ? "bg-forest text-white" : "text-muted hover:text-forest"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              {descTab === "write" ? (
                <textarea
                  className="field min-h-[220px] font-[inherit] leading-relaxed"
                  value={form.longDescription}
                  onChange={(e) => set("longDescription", e.target.value)}
                  placeholder={"Tell the full story: design, movement, who it is for.\n\nLeave an empty line between paragraphs.\n\n- Start a line with a dash for bullet points\n- Like this"}
                />
              ) : (
                <div className="min-h-[220px] rounded-lg border border-line bg-sand/50 p-4 text-sm">
                  {form.longDescription.trim() ? <RichText text={form.longDescription} /> : <p className="text-muted">Nothing to preview yet.</p>}
                </div>
              )}
              <span className="mt-1 block text-xs text-muted">Shown in the Description section of the product page. Empty line = new paragraph, "- " = bullet.</span>
            </div>

            <Field label="Specifications" hint='Case size, movement, glass, water resistance, strap. Use "- " for bullets.'>
              <textarea
                className="field min-h-[110px]"
                value={form.specs}
                onChange={(e) => set("specs", e.target.value)}
                placeholder={"- Case size: 42mm\n- Movement: Automatic\n- Water resistance: 200m"}
              />
            </Field>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Product views</h2>
                <p className="text-xs text-muted">Four angles shown as thumbnails beside the main image. Front is required.</p>
              </div>
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-forest">{viewCount}/4 views</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PRODUCT_VIEWS.map((v) => (
                <ViewSlot
                  key={v.key}
                  label={v.label}
                  hint={VIEW_HINTS[v.key]}
                  src={form.views[v.key]}
                  busy={slotBusy[v.key]}
                  onFile={(file) => uploadToView(v.key, file)}
                  onRemove={() => setView(v.key, "")}
                />
              ))}
            </div>

            <div className="mt-7 border-t border-line pt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Extra images <span className="font-normal text-muted">(optional)</span></h3>
                <span className="text-xs text-muted">Lifestyle or colour shots, shown after the four views</span>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {form.extraImages.map((src, i) => (
                  <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-sand">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set("extraImages", form.extraImages.filter((_, j) => j !== i))}
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-muted transition hover:border-forest hover:text-forest"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin text-forest" /> : <Plus size={18} />}
                  {uploading ? `${uploading}…` : "Add"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <select value={urlTarget} onChange={(e) => setUrlTarget(e.target.value)} className="field py-2.5 sm:w-40" aria-label="Where to add the URL">
                {PRODUCT_VIEWS.map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.label} view
                  </option>
                ))}
                <option value="extra">Extra image</option>
              </select>
              <input
                className="field py-2.5"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                placeholder="…or paste an image URL"
              />
              <button type="button" onClick={addImageUrl} className="btn-outline py-2.5">
                Add
              </button>
              <button type="button" onClick={() => setGalleryOpen(true)} className="btn-outline gap-2 py-2.5">
                <ImagePlus size={16} /> Gallery
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Sizes</h2>
            <p className="mb-4 text-xs text-muted">Case sizes (strap widths for accessories) the customer picks from. Leave empty if there is only one.</p>
            <div className="flex flex-wrap gap-2">
              {[...sizePresets, ...extraSizes].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`min-w-[52px] rounded border px-3 py-2 text-sm transition ${
                    form.sizes.includes(s) ? "border-forest bg-forest text-white" : "border-line hover:border-forest"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="field py-2.5 sm:w-48"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  if (customSize.trim() && !form.sizes.includes(customSize.trim())) set("sizes", [...form.sizes, customSize.trim()]);
                  setCustomSize("");
                }}
                placeholder="Custom size, press Enter"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Colours</h2>
            {form.colors.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {form.colors.map((c, i) => (
                  <span key={c.name + i} className="inline-flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2 text-sm">
                    <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: c.hex }} />
                    {c.name}
                    <button type="button" onClick={() => set("colors", form.colors.filter((_, j) => j !== i))} aria-label={`Remove ${c.name}`}>
                      <X size={14} className="text-muted hover:text-forest" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => setColor({ ...color, hex: e.target.value })}
                className="h-11 w-12 cursor-pointer rounded border border-line bg-white p-1"
                aria-label="Colour swatch"
              />
              <input
                className="field py-2.5 sm:w-56"
                value={color.name}
                onChange={(e) => setColor({ ...color, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                placeholder="Colour name, e.g. Midnight Blue"
              />
              <button type="button" onClick={addColor} className="btn-outline gap-1 py-2.5">
                <Plus size={15} /> Add
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Visibility</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Visible in store</p>
                <p className="text-xs text-muted">Hidden products stay in the dashboard</p>
              </div>
              <Toggle label="Visible in store" checked={form.isActive} onChange={(v) => set("isActive", v)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Bestseller</p>
                <p className="text-xs text-muted">Shown in Best Sellers on the homepage</p>
              </div>
              <Toggle label="Bestseller" checked={form.bestseller} onChange={(v) => set("bestseller", v)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">New arrival</p>
                <p className="text-xs text-muted">Pinned to Latest Arrivals on the homepage</p>
              </div>
              <Toggle label="New arrival" checked={form.isNew} onChange={(v) => set("isNew", v)} />
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Organisation</h2>
            <Field label="Brand" hint="Groups the watch on the Brands page">
              <input className="field" list="brand-options" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Seiko" />
              <datalist id="brand-options">
                {BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
            <Field label="Category">
              <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Collection" hint="Optional: Classic, Sport or Luxury">
              <select className="field" value={form.collection} onChange={(e) => set("collection", e.target.value)}>
                <option value="">None</option>
                {COLLECTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Movement" hint="Shown under the name, e.g. Automatic • Men's">
              <select className="field" value={form.movement} onChange={(e) => set("movement", e.target.value)}>
                <option value="">Not set</option>
                {MOVEMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Rating</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stars (0–5)">
                <input type="number" min="0" max="5" step="0.1" className="field" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
              </Field>
              <Field label="Reviews">
                <input type="number" min="0" step="1" className="field" value={form.reviews} onChange={(e) => set("reviews", e.target.value)} />
              </Field>
            </div>
            <p className="text-xs text-muted">Leave stars empty to hide the rating on the store.</p>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Pricing & stock</h2>
            <Field label={`Price (${CURRENCY_SYMBOL})`}>
              <input type="number" min="0" step="1" className="field" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </Field>
            <Field label="Compare-at price" hint="Higher than price to show it as on sale">
              <input type="number" min="0" step="1" className="field" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
            </Field>
            <Field
              label="Stock"
              hint={form.stock !== "" && Number(form.stock) <= LOW_STOCK_THRESHOLD ? "Low stock warning active" : "Leave empty to not track stock"}
              className={form.stock !== "" && Number(form.stock) <= LOW_STOCK_THRESHOLD ? "text-amber-700" : ""}
            >
              <input type="number" min="0" step="1" className={`field ${form.stock !== "" && Number(form.stock) <= LOW_STOCK_THRESHOLD ? "border-amber-500" : ""}`} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </Field>
          </Card>
        </div>
      </div>

      <GalleryPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(src) => addFromSource(src, urlTarget)}
      />

      <ImageCropper
        open={cropState.open}
        image={cropState.image}
        onCancel={() => setCropState({ open: false, image: null, target: null })}
        onComplete={handleCropComplete}
      />
    </form>
  );
}
