"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { AlertCircle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useCollection } from "../../../lib/useCollection";
import { can } from "../../../lib/admin";
import { CATEGORIES, categoryName, formatPrice, LOW_STOCK_THRESHOLD } from "../../../lib/config";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { EmptyState, Loading, PageHeader, SearchInput, TableShell, Td, Th, Toggle } from "../../../components/admin/ui";

export default function AdminProducts() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const { data: products, loading } = useCollection("products");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const editable = can(userProfile?.role, "manageProducts");

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return products.filter((p) => (!category || p.category === category) && (!q || `${p.title} ${p.brand || ""}`.toLowerCase().includes(q)));
  }, [products, term, category]);

  async function patch(product, fields, message) {
    try {
      await updateDoc(doc(db, "products", product.id), { ...fields, updatedAt: serverTimestamp() });

      // Trigger on-demand ISR revalidation
      try {
        const { revalidateProduct } = await import("../../../lib/server/actions");
        await revalidateProduct(product.id);
      } catch (revalErr) {
        console.warn("Revalidation skipped:", revalErr);
      }

      addToast(message);
    } catch {
      addToast("Could not update the product", "error");
    }
  }

  async function remove(product) {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "products", product.id));

      // Trigger on-demand ISR revalidation
      try {
        const { revalidateProduct } = await import("../../../lib/server/actions");
        await revalidateProduct(product.id);
      } catch (revalErr) {
        console.warn("Revalidation skipped:", revalErr);
      }

      addToast("Product deleted");
    } catch {
      addToast("Could not delete the product", "error");
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} in catalogue`}
        actions={
          <>
            <SearchInput value={term} onChange={setTerm} placeholder="Search products" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="field w-auto py-2.5">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            {editable && (
              <Link href="/admin/products/new" className="btn-dark gap-2 py-2.5">
                <Plus size={16} /> Add product
              </Link>
            )}
          </>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon={Package}
            title={products.length ? "No products match" : "No products yet"}
            text={products.length ? "Try a different search or category." : "Add your first product, or import the sample catalogue from the Overview page."}
            action={
              editable &&
              !products.length && (
                <Link href="/admin/products/new" className="btn-dark gap-2">
                  <Plus size={16} /> Add product
                </Link>
              )
            }
          />
        </div>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Bestseller</Th>
              <Th>Visible</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const stock = p.stock === undefined || p.stock === null ? null : Number(p.stock);
              return (
                <tr key={p.id} className="hover:bg-sand">
                  <Td>
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <span className="grid h-12 w-12 place-items-center rounded-lg bg-cream text-forest">
                          <Package size={16} />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-xs text-muted">{[p.brand, p.movement].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{categoryName(p.category)}</Td>
                  <Td>
                    <p className="font-semibold">{formatPrice(p.price)}</p>
                    {p.compareAtPrice > p.price && <p className="text-xs text-muted line-through">{formatPrice(p.compareAtPrice)}</p>}
                  </Td>
                  <Td>
                    {stock === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${stock <= 0 ? "text-red-600" : stock <= LOW_STOCK_THRESHOLD ? "text-amber-700" : ""}`}>
                          {stock <= 0 ? "Sold out" : stock}
                        </span>
                        {stock > 0 && stock <= LOW_STOCK_THRESHOLD && (
                          <span title="Low stock warning" className="text-amber-600">
                            <AlertCircle size={14} />
                          </span>
                        )}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Toggle
                      label="Bestseller"
                      checked={!!p.bestseller}
                      disabled={!editable}
                      onChange={(v) => patch(p, { bestseller: v }, v ? "Added to bestsellers" : "Removed from bestsellers")}
                    />
                  </Td>
                  <Td>
                    <Toggle
                      label="Visible in store"
                      checked={p.isActive !== false}
                      disabled={!editable}
                      onChange={(v) => patch(p, { isActive: v }, v ? "Product is now visible" : "Product hidden from store")}
                    />
                  </Td>
                  <Td className="text-right">
                    {editable && (
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/products/${p.id}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream hover:text-forest" aria-label="Edit">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => remove(p)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
