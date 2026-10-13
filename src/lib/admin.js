export const ROLES = ["admin", "manager", "confirmer", "customer"];
export const STAFF_ROLES = ["admin", "manager", "confirmer"];

const PERMISSIONS = {
  viewDashboard: STAFF_ROLES,
  updateOrders: STAFF_ROLES,
  deleteOrders: ["admin"],
  manageProducts: ["admin", "manager"],
  manageSubscribers: ["admin", "manager"],
  manageSettings: ["admin", "manager"],
  manageTeam: ["admin"],
};

export const can = (role, permission) => PERMISSIONS[permission]?.includes(role) ?? false;

export const ORDER_STATUSES = [
  { id: "Pending", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  { id: "Confirmed", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  { id: "Shipped", tone: "bg-violet-50 text-violet-700 ring-violet-200" },
  { id: "Delivered", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { id: "Cancelled", tone: "bg-red-50 text-red-700 ring-red-200" },
];

export const statusTone = (status) => ORDER_STATUSES.find((s) => s.id === status)?.tone || "bg-sand text-ink ring-line";

export const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value, withTime = false) => {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

export const shortId = (id = "") => `#${id.slice(0, 8).toUpperCase()}`;

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
