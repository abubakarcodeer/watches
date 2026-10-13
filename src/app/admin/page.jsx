"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { doc, serverTimestamp, writeBatch } from "../../lib/store";
import { AlertTriangle, ArrowRight, DollarSign, Mail, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { db } from "../../lib/firebase";
import { useCollection } from "../../lib/useCollection";
import { can, formatDate, ORDER_STATUSES, shortId, toDate } from "../../lib/admin";
import { formatPrice } from "../../lib/config";
import { SEED_PRODUCTS } from "../../data/products";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, EmptyState, Loading, PageHeader, StatCard, StatusBadge } from "../../components/admin/ui";

const DAYS = 14;
const LOW_STOCK = 5;

export default function AdminOverview() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const orders = useCollection("orders");
  const products = useCollection("products");
  const subscribers = useCollection("subscribers");
  const [seeding, setSeeding] = useState(false);

  const stats = useMemo(() => {
    const live = orders.data.filter((o) => o.status !== "Cancelled");
    const revenue = live.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: DAYS }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (DAYS - 1 - i));
      return { date, total: 0, count: 0 };
    });
    for (const o of live) {
      const d = toDate(o.createdAt);
      if (!d) continue;
      d.setHours(0, 0, 0, 0);
      const bucket = days.find((day) => day.date.getTime() === d.getTime());
      if (bucket) {
        bucket.total += Number(o.total) || 0;
        bucket.count += 1;
      }
    }

    const sold = new Map();
    for (const o of live) {
      for (const item of o.items || []) {
        const entry = sold.get(item.id) || { id: item.id, title: item.title, image: item.image, quantity: 0, revenue: 0 };
        entry.quantity += Number(item.quantity) || 0;
        entry.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
        sold.set(item.id, entry);
      }
    }

    return {
      revenue,
      average: live.length ? revenue / live.length : 0,
      pending: orders.data.filter((o) => o.status === "Pending").length,
      days,
      maxDay: Math.max(...days.map((d) => d.total), 1),
      byStatus: ORDER_STATUSES.map((s) => ({ ...s, count: orders.data.filter((o) => o.status === s.id).length })),
      topProducts: [...sold.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
      lowStock: products.data.filter((p) => p.stock !== undefined && Number(p.stock) <= LOW_STOCK).slice(0, 6),
    };
  }, [orders.data, products.data]);

  async function importSampleCatalogue() {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const product of SEED_PRODUCTS) {
        batch.set(doc(db, "products", product.id), { ...product, stock: 50, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      await batch.commit();
      addToast(`Imported ${SEED_PRODUCTS.length} products`);
    } catch (err) {
      console.error(err);
      addToast("Import failed: check your role and Firestore rules", "error");
    } finally {
      setSeeding(false);
    }
  }

  if (orders.loading || products.loading) return <Loading />;

  const firstName = userProfile?.firstName || "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here is what is happening in your store."
        actions={
          <Link href="/admin/orders" className="btn-dark gap-2 py-2.5">
            View orders <ArrowRight size={16} />
          </Link>
        }
      />

      {products.data.length === 0 && can(userProfile?.role, "manageProducts") && (
        <Card className="mb-6 flex flex-col items-start justify-between gap-4 border-gold-soft bg-cream p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Your Firestore catalogue is empty</p>
            <p className="text-sm text-muted">The storefront is showing sample products. Import them to start editing, or add your own.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={importSampleCatalogue} disabled={seeding} className="btn-dark py-2.5">
              {seeding ? "Importing…" : "Import sample catalogue"}
            </button>
            <Link href="/admin/products/new" className="btn-outline bg-white py-2.5">
              Add product
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} hint="Excludes cancelled orders" icon={DollarSign} />
        <StatCard label="Orders" value={orders.data.length} hint={`${stats.pending} pending`} icon={ShoppingBag} />
        <StatCard label="Avg. order" value={formatPrice(stats.average)} icon={TrendingUp} />
        <StatCard label="Subscribers" value={subscribers.data.length} hint={`${products.data.length} products live`} icon={Mail} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Revenue, last {DAYS} days</h2>
            <span className="text-sm text-muted">{formatPrice(stats.days.reduce((s, d) => s + d.total, 0))}</span>
          </div>
          <div className="mt-6 flex h-52 items-end gap-1.5 sm:gap-2.5">
            {stats.days.map((day) => (
              <div key={day.date.toISOString()} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="relative w-full flex-1">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-md bg-forest/80 transition group-hover:bg-forest"
                    style={{ height: `${Math.max((day.total / stats.maxDay) * 100, day.total ? 4 : 1.5)}%` }}
                  />
                  <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                    {formatPrice(day.total)} · {day.count} orders
                  </span>
                </div>
                <span className="text-[10px] text-muted">{day.date.getDate()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Orders by status</h2>
          <ul className="mt-5 space-y-4">
            {stats.byStatus.map((s) => (
              <li key={s.id}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{s.id}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${orders.data.length ? (s.count / orders.data.length) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-forest hover:underline">
              See all
            </Link>
          </div>
          {orders.data.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" text="New checkouts will appear here in real time." />
          ) : (
            <ul className="divide-y divide-line">
              {orders.data.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders?id=${o.id}`} className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-sand">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{o.customer}</p>
                      <p className="text-xs text-muted">
                        {shortId(o.id)} · {formatDate(o.createdAt, true)}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                    <span className="w-20 text-right font-semibold">{formatPrice(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Best sellers</h2>
            {stats.topProducts.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No sales yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {stats.topProducts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 text-sm">
                    {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" /> : <Package size={20} />}
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    <span className="text-muted">{p.quantity} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} className="text-amber-600" /> Low stock
            </h2>
            {stats.lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Everything is well stocked.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {stats.lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between text-sm hover:text-forest">
                      <span className="truncate">{p.title}</span>
                      <span className={`font-semibold ${Number(p.stock) <= 0 ? "text-red-600" : "text-amber-700"}`}>{Number(p.stock) <= 0 ? "Sold out" : `${p.stock} left`}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
