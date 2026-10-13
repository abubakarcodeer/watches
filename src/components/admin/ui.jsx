"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { statusTone } from "../../lib/admin";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[28px] leading-tight md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className = "", children }) {
  return <div className={`rounded-xl border border-line bg-white ${className}`}>{children}</div>;
}

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cream text-forest">
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold md:text-[28px]">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusTone(status)}`}>{status}</span>;
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-full bg-cream text-forest">
          <Icon size={24} />
        </span>
      )}
      <p className="mt-4 font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${checked ? "bg-forest" : "bg-line"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="field w-full py-2.5 sm:w-72"
    />
  );
}

export function Drawer({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <aside className="ml-auto flex h-full w-full max-w-xl animate-slideIn flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

export const Field = ({ label, hint, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
  </label>
);

export function TableShell({ children }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
      </div>
    </Card>
  );
}

export const Th = ({ children, className = "" }) => (
  <th className={`border-b border-line bg-sand px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted ${className}`}>{children}</th>
);

export const Td = ({ children, className = "" }) => <td className={`border-b border-line px-4 py-3 align-middle ${className}`}>{children}</td>;

export function Loading() {
  return (
    <div className="grid place-items-center py-24">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-forest-soft border-t-forest" />
    </div>
  );
}
