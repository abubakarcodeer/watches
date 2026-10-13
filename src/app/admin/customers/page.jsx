"use client";

import { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Users } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useCollection } from "../../../lib/useCollection";
import { can, formatDate, ROLES, STAFF_ROLES } from "../../../lib/admin";
import { formatPrice } from "../../../lib/config";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { EmptyState, Loading, PageHeader, SearchInput, TableShell, Td, Th } from "../../../components/admin/ui";

const ROLE_HELP = {
  admin: "Everything, including team roles",
  manager: "Orders, products, subscribers, settings",
  confirmer: "View dashboard and update order status",
  customer: "No dashboard access",
};

export default function CustomersPage() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const users = useCollection("users");
  const orders = useCollection("orders");
  const [term, setTerm] = useState("");
  const [view, setView] = useState("all");
  const canManageTeam = can(userProfile?.role, "manageTeam");

  const spend = useMemo(() => {
    const totals = new Map();
    for (const o of orders.data) {
      if (!o.userId || o.status === "Cancelled") continue;
      const t = totals.get(o.userId) || { count: 0, total: 0 };
      t.count += 1;
      t.total += Number(o.total) || 0;
      totals.set(o.userId, t);
    }
    return totals;
  }, [orders.data]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return users.data.filter((u) => {
      const isStaff = STAFF_ROLES.includes(u.role);
      if (view === "staff" && !isStaff) return false;
      if (view === "customers" && isStaff) return false;
      return !q || [u.email, u.firstName, u.lastName].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [users.data, term, view]);

  async function changeRole(user, role) {
    if (user.id === currentUser.uid) return addToast("You cannot change your own role", "error");
    if (role === "admin" && !window.confirm(`Give ${user.email} full admin access?`)) return;
    try {
      await updateDoc(doc(db, "users", user.id), { role });
      addToast(`${user.email} is now ${role}`);
    } catch {
      addToast("Could not change the role", "error");
    }
  }

  if (users.loading) return <Loading />;

  const staffCount = users.data.filter((u) => STAFF_ROLES.includes(u.role)).length;

  return (
    <>
      <PageHeader
        title="Customers & Team"
        subtitle={`${users.data.length - staffCount} customers · ${staffCount} staff`}
        actions={<SearchInput value={term} onChange={setTerm} placeholder="Search name or email" />}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          ["all", "Everyone"],
          ["customers", "Customers"],
          ["staff", "Team"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${view === id ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-forest"}`}
          >
            {label}
          </button>
        ))}
        {!canManageTeam && <span className="text-xs text-muted">Only admins can change roles.</span>}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState icon={Users} title="No accounts found" text="Customers appear here after they create an account." />
        </div>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Joined</Th>
              <Th>Orders</Th>
              <Th>Spent</Th>
              <Th>Role</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const s = spend.get(u.id);
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
              return (
                <tr key={u.id} className="hover:bg-sand">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-sm font-semibold uppercase text-forest">
                        {(u.firstName || u.email || "?").charAt(0)}
                      </span>
                      <div>
                        <p className="font-medium">
                          {name} {u.id === currentUser.uid && <span className="text-xs text-muted">(you)</span>}
                        </p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{formatDate(u.createdAt)}</Td>
                  <Td>{s?.count || 0}</Td>
                  <Td className="font-semibold">{formatPrice(s?.total || 0)}</Td>
                  <Td>
                    {canManageTeam && u.id !== currentUser.uid ? (
                      <select
                        value={u.role || "customer"}
                        onChange={(e) => changeRole(u, e.target.value)}
                        title={ROLE_HELP[u.role || "customer"]}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold capitalize outline-none focus:border-forest"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        title={ROLE_HELP[u.role || "customer"]}
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          STAFF_ROLES.includes(u.role) ? "bg-forest text-white" : "bg-sand text-muted"
                        }`}
                      >
                        {u.role || "customer"}
                      </span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((r) => (
          <div key={r} className="rounded-lg border border-line bg-white p-4 text-sm">
            <p className="font-semibold capitalize">{r}</p>
            <p className="mt-1 text-xs text-muted">{ROLE_HELP[r]}</p>
          </div>
        ))}
      </div>
    </>
  );
}
