"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteDoc, doc, increment, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { Download, ShoppingBag, Trash2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useCollection } from "../../../lib/useCollection";
import { can, downloadCsv, formatDate, ORDER_STATUSES, shortId } from "../../../lib/admin";
import { formatPrice } from "../../../lib/config";
import { formatPkPhone, normalizePkPhone, whatsappLink } from "../../../data/pakistan";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Drawer, EmptyState, Loading, PageHeader, SearchInput, StatusBadge, TableShell, Td, Th } from "../../../components/admin/ui";
import ShippingLabels from "../../../components/admin/ShippingLabels";

function OrderDetails({ order, role, onStatus, onDelete, onNote }) {
  const [note, setNote] = useState(order.adminNote || "");
  const s = order.shipping || {};

  return (
    <div className="space-y-7 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted">{formatDate(order.createdAt, true)}</p>
          <p className="mt-1 text-xl font-semibold">{formatPrice(order.total)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Update status</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((st) => (
            <button
              key={st.id}
              onClick={() => onStatus(order, st.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                order.status === st.id ? "border-forest bg-forest text-white" : "border-line hover:border-forest hover:text-forest"
              }`}
            >
              {st.id}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Customer</h3>
          <p className="font-semibold">{order.customer}</p>
          {order.email && <a href={`mailto:${order.email}`} className="block text-forest hover:underline">{order.email}</a>}
          <a href={`tel:${order.phone}`} className="block hover:text-forest">{formatPkPhone(order.phone)}</a>
          {whatsappLink(order.phone) && (
            <a
              href={whatsappLink(order.phone, `Hello ${order.customer}, this is WatchShop about your order ${shortId(order.id)}.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:underline"
            >
              Message on WhatsApp
            </a>
          )}
          <p className="mt-1 text-xs text-muted">{order.userId ? "Registered customer" : "Guest checkout"}</p>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Deliver to</h3>
          <p>{s.address}</p>
          <p>{[s.city, s.province, s.postalCode].filter(Boolean).join(", ")}</p>
          <p>{s.country}</p>
          <p className="mt-1 text-xs text-muted">{order.paymentMethod}</p>
          {order.notes && <p className="mt-2 rounded bg-sand px-2 py-1.5 text-xs">Note: {order.notes}</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Items</h3>
        <ul className="divide-y divide-line rounded-lg border border-line">
          {(order.items || []).map((item, i) => (
            <li key={`${item.id}-${i}`} className="flex items-center gap-3 p-3">
              {item.image && <img src={item.image} alt="" className="h-14 w-11 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
              </div>
              <span className="text-muted">× {item.quantity}</span>
              <span className="w-20 text-right font-semibold">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.shippingCost ? formatPrice(order.shippingCost) : "Free"}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Internal note</h3>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="field" placeholder="Visible to staff only" />
        <button onClick={() => onNote(order, note)} disabled={note === (order.adminNote || "")} className="btn-outline mt-2 py-2">
          Save note
        </button>
      </section>

      <section className="pt-4 border-t border-line">
        <button
          onClick={() => window.print()}
          className="btn-dark w-full py-2.5 flex items-center justify-center gap-2"
        >
          Print Shipping Label
        </button>
      </section>

      {can(role, "deleteOrders") && (
        <button onClick={() => onDelete(order)} className="flex items-center gap-2 text-sm font-semibold text-forest-deep hover:underline">
          <Trash2 size={15} /> Delete order
        </button>
      )}
    </div>
  );
}

function OrdersContent() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const initialMode = searchParams.get("mode") || "Orders";

  const { data: orders, loading: loadingOrders } = useCollection("orders");
  const { data: checkouts, loading: loadingCheckouts } = useCollection("checkouts");

  const [mode, setMode] = useState(initialMode);
  const [status, setStatus] = useState("All");
  const [term, setTerm] = useState("");

  const filteredOrders = useMemo(() => {
    const q = term.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === "All" || o.status === status) &&
        (!q || [o.id, o.customer, o.email, o.phone, o.shipping?.city, normalizePkPhone(q)].some((v, i) => v && (i === 5 ? v === o.phone : String(v).toLowerCase().includes(q))))
    );
  }, [orders, status, term]);

  const filteredCheckouts = useMemo(() => {
    const q = term.trim().toLowerCase();
    return checkouts.filter(
      (c) =>
        !q || [c.id, c.customer, c.email, c.phone, c.shipping?.city, normalizePkPhone(q)].some((v) => v && String(v).toLowerCase().includes(q))
    );
  }, [checkouts, term]);

  const selected = (mode === "Orders" ? orders : checkouts).find((o) => o.id === selectedId);
  const openOrder = (id) => {
    const url = id ? `/admin/orders?id=${id}&mode=${mode}` : `/admin/orders?mode=${mode}`;
    router.push(url, { scroll: false });
  };

  const setModeAndQuery = (m) => {
    setMode(m);
    router.push(`/admin/orders?mode=${m}`, { scroll: false });
  };

  async function changeStatus(order, next) {
    if (order.status === next) return;
    try {
      const batch = writeBatch(db);

      // Decrement stock if confirmed
      if (next === "Confirmed" && order.status !== "Confirmed") {
        (order.items || []).forEach((item) => {
          if (item.id) {
            batch.update(doc(db, "products", item.id), {
              stock: increment(-Number(item.quantity || 1)),
              updatedAt: serverTimestamp(),
            });
          }
        });
      }

      // Restore stock if previously confirmed order is cancelled
      if (next === "Cancelled" && order.status === "Confirmed") {
        (order.items || []).forEach((item) => {
          if (item.id) {
            batch.update(doc(db, "products", item.id), {
              stock: increment(Number(item.quantity || 1)),
              updatedAt: serverTimestamp(),
            });
          }
        });
      }

      batch.update(doc(db, "orders", order.id), {
        status: next,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      addToast(`${shortId(order.id)} marked ${next}`);
    } catch (err) {
      console.error("Status change error:", err);
      addToast("Could not update the order status", "error");
    }
  }

  async function saveNote(order, adminNote) {
    try {
      await updateDoc(doc(db, "orders", order.id), { adminNote, updatedAt: serverTimestamp() });
      addToast("Note saved");
    } catch {
      addToast("Could not save the note", "error");
    }
  }

  async function removeOrder(order) {
    if (!window.confirm(`Delete ${mode === "Orders" ? "order" : "checkout"} ${shortId(order.id)} permanently?`)) return;
    try {
      await deleteDoc(doc(db, mode === "Orders" ? "orders" : "checkouts", order.id));
      openOrder(null);
      addToast(mode === "Orders" ? "Order deleted" : "Checkout deleted");
    } catch {
      addToast("Could not delete", "error");
    }
  }

  function exportCsv() {
    const data = mode === "Orders" ? filteredOrders : filteredCheckouts;
    downloadCsv(
      `watchshop-${mode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
      data.map((o) => ({
        id: o.id,
        date: formatDate(o.createdAt, true),
        status: o.status || "Incomplete",
        customer: o.customer,
        email: o.email,
        phone: o.phone,
        address: [o.shipping?.address, o.shipping?.city, o.shipping?.province, o.shipping?.postalCode].filter(Boolean).join(", "),
        items: (o.items || []).map((i) => `${i.quantity}x ${i.title} ${[i.color, i.size].filter(Boolean).join("/")}`).join("; "),
        total: o.total,
      }))
    );
  }

  if (loadingOrders || loadingCheckouts) return <Loading />;

  return (
    <>
      <PageHeader
        title={mode}
        subtitle={mode === "Orders" ? `${orders.length} total · updates in real time` : `${checkouts.length} abandoned sessions`}
        actions={
          <>
            <SearchInput value={term} onChange={setTerm} placeholder="Search name, phone, city, ID" />
            <button onClick={exportCsv} disabled={!(mode === "Orders" ? filteredOrders : filteredCheckouts).length} className="btn-outline gap-2 bg-white py-2.5 disabled:opacity-40">
              <Download size={16} /> Export
            </button>
            {mode === "Orders" && (
              <button
                onClick={() => window.print()}
                disabled={!filteredOrders.length}
                className="btn-outline gap-2 bg-white py-2.5 disabled:opacity-40"
              >
                Print Labels ({filteredOrders.length})
              </button>
            )}
          </>
        }
      />

      <div className="mb-8 flex border-b border-line">
        {["Orders", "Incomplete"].map((m) => (
          <button
            key={m}
            onClick={() => setModeAndQuery(m)}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              mode === m ? "border-b-2 border-forest text-forest" : "text-muted hover:text-forest"
            }`}
          >
            {m === "Incomplete" ? `Incomplete (${checkouts.length})` : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {mode === "Orders" && (
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", ...ORDER_STATUSES.map((s) => s.id)].map((s) => {
            const count = s === "All" ? orders.length : orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${status === s ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-forest"}`}
              >
                {s} <span className={status === s ? "text-white/80" : "text-muted"}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {(mode === "Orders" ? filteredOrders : filteredCheckouts).length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon={ShoppingBag}
            title={mode === "Orders" ? "No orders found" : "No incomplete checkouts"}
            text={mode === "Orders" ? (orders.length ? "Try another filter or search." : "Orders placed at checkout show up here.") : "Sessions where users entered info but didn't finish appear here."}
          />
        </div>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>{mode === "Orders" ? "Order" : "Session"}</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              {mode === "Orders" && <Th>Status</Th>}
            </tr>
          </thead>
          <tbody>
            {(mode === "Orders" ? filteredOrders : filteredCheckouts).map((o) => (
              <tr key={o.id} onClick={() => openOrder(o.id)} className="cursor-pointer transition hover:bg-sand">
                <Td>
                  <p className="font-semibold">{shortId(o.id)}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt, true)}</p>
                </Td>
                <Td>
                  <p className="font-medium">{o.customer || "Anonymous"}</p>
                  <p className="text-xs text-muted">{o.shipping?.city || o.email || o.phone || "No contact info"}</p>
                </Td>
                <Td className="text-muted">{(o.items || []).reduce((n, i) => n + (Number(i.quantity) || 0), 0)} items</Td>
                <Td className="font-semibold">{formatPrice(o.total)}</Td>
                {mode === "Orders" && (
                  <Td>
                    <select
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => changeStatus(o, e.target.value)}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-forest"
                      aria-label="Order status"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st.id}>{st.id}</option>
                      ))}
                    </select>
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Drawer open={!!selected} onClose={() => openOrder(null)} title={selected ? `${mode === "Orders" ? "Order" : "Checkout"} ${shortId(selected.id)}` : ""}>
        {selected && (
          mode === "Orders" ? (
            <OrderDetails key={selected.id} order={selected} role={userProfile?.role} onStatus={changeStatus} onDelete={removeOrder} onNote={saveNote} />
          ) : (
            <div className="space-y-7 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-muted">Abandoned on {formatDate(selected.createdAt, true)}</p>
                  <p className="mt-1 text-xl font-semibold">{formatPrice(selected.total)}</p>
                </div>
                <StatusBadge status="Incomplete" />
              </div>

              <section className="grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Customer Contact</h3>
                  <p className="font-semibold">{selected.customer || "N/A"}</p>
                  {selected.email && <a href={`mailto:${selected.email}`} className="block text-forest hover:underline">{selected.email}</a>}
                  {selected.phone && <a href={`tel:${selected.phone}`} className="block hover:text-forest">{formatPkPhone(selected.phone)}</a>}
                  {selected.phone && whatsappLink(selected.phone) && (
                    <a
                      href={whatsappLink(selected.phone, `Hello ${selected.customer}, we noticed you were looking at some items at WatchShop. Need any help finishing your order?`)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Message on WhatsApp
                    </a>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Intended Address</h3>
                  <p>{selected.shipping?.address || "—"}</p>
                  <p>{[selected.shipping?.city, selected.shipping?.province, selected.shipping?.postalCode].filter(Boolean).join(", ") || "—"}</p>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Cart Items</h3>
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {(selected.items || []).map((item, i) => (
                    <li key={`${item.id}-${i}`} className="flex items-center gap-3 p-3">
                      {item.image && <img src={item.image} alt="" className="h-14 w-11 rounded object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                      </div>
                      <span className="text-muted">× {item.quantity}</span>
                      <span className="w-20 text-right font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <button onClick={() => removeOrder(selected)} className="flex items-center gap-2 text-sm font-semibold text-forest-deep hover:underline">
                <Trash2 size={15} /> Delete session record
              </button>
            </div>
          )
        )}
      </Drawer>

      {mode === "Orders" && <ShippingLabels orders={selected ? [selected] : filteredOrders} />}
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersContent />
    </Suspense>
  );
}
