"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "../../lib/store";
import { LayoutDashboard, Package } from "lucide-react";
import { db } from "../../lib/firebase";
import { STAFF_ROLES, toDate } from "../../lib/admin";
import { formatPrice } from "../../lib/config";
import { useAuth } from "../../context/AuthContext";

export default function AccountPage() {
  const { currentUser, userProfile, loading, logout, sendVerification } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) router.replace("/login");
  }, [loading, currentUser, router]);

  useEffect(() => {
    if (!currentUser) return;
    getDocs(query(collection(db, "orders"), where("userId", "==", currentUser.uid)))
      .then((snap) =>
        setOrders(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
        )
      )
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setOrders([]);
      });
  }, [currentUser]);

  if (loading || !currentUser) return <div className="container py-32 text-center text-muted">Loading…</div>;

  const name = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || currentUser.displayName || "there";

  return (
    <div className="container py-12 md:py-16">
      {!currentUser.emailVerified && (
        <div className="mb-10 flex flex-col items-center justify-between gap-4 border border-forest/30 bg-forest/5 p-5 text-sm sm:flex-row">
          <p>
            <b>Please verify your email address.</b> A verification link was sent to {currentUser.email}.
          </p>
          <button
            disabled={sent}
            onClick={() => {
              sendVerification();
              setSent(true);
              setTimeout(() => setSent(false), 30000);
            }}
            className="font-semibold text-forest hover:underline disabled:text-muted"
          >
            {sent ? "Sent! Check your inbox" : "Resend verification email"}
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-b border-line pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">My Account</p>
          <h1 className="mt-2 text-4xl md:text-5xl">Hello, {name}</h1>
          <p className="mt-2 text-sm text-muted">{currentUser.email}</p>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          {STAFF_ROLES.includes(userProfile?.role) && (
            <Link href="/admin" className="btn-dark gap-2">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          <button onClick={() => logout().then(() => router.push("/"))} className="btn-outline">
            Sign Out
          </button>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Order History</h2>
      {orders === null ? (
        <p className="mt-6 text-sm text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-4 bg-sand p-8">
          <Package size={28} strokeWidth={1.3} />
          <p className="text-sm text-muted">You have not placed any orders yet.</p>
          <Link href="/shop" className="btn-dark">
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
              <div>
                <p className="font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-muted">
                  {toDate(o.createdAt)?.toLocaleDateString() || ""} · {o.items?.reduce((n, i) => n + i.quantity, 0)} items
                </p>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{o.status}</span>
              <span className="font-semibold">{formatPrice(o.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
