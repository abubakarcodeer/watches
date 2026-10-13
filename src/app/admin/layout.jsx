"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  PlugZap,
  ShieldAlert,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { db, isFirebaseConfigured } from "../../lib/firebase";
import { can, STAFF_ROLES } from "../../lib/admin";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { LogoMark } from "../../components/ui/Logo";
import { Loading } from "../../components/admin/ui";
import { STORE_NAME } from "../../lib/config";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, permission: "viewDashboard" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "updateOrders" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "viewDashboard" },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail, permission: "viewDashboard" },
  { href: "/admin/customers", label: "Customers & Team", icon: Users, permission: "viewDashboard" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "manageSettings" },
];

// Shown instead of the login redirect while .env.local has no Firebase keys.
function SetupRequired() {
  return (
    <div className="grid min-h-screen place-items-center bg-sand px-5">
      <div className="w-full max-w-lg rounded-xl border border-line bg-white p-8">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-cream text-forest">
          <PlugZap size={26} />
        </span>
        <h1 className="mt-5 text-2xl">Connect Firebase to open the dashboard</h1>
        <p className="mt-2 text-sm text-muted">The storefront is running on the sample catalogue. Orders, products, customers and settings need a Firebase project.</p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-ink/80">
          <li>Create a Firebase project and enable <b>Authentication</b> (Email/Password, Google) and <b>Firestore</b>.</li>
          <li>Copy <code className="rounded bg-sand px-1">.env.example</code> to <code className="rounded bg-sand px-1">.env.local</code> and paste the web app config.</li>
          <li>Deploy <code className="rounded bg-sand px-1">firestore.rules</code>, then restart the dev server.</li>
        </ol>
        <Link href="/" className="btn-outline mt-6">
          Back to store
        </Link>
      </div>
    </div>
  );
}

function NoAccess({ user, onLogout }) {
  const { addToast } = useToast();

  // Succeeds only for emails listed in firestore.rules `bootstrapAdmins`.
  async function claimAdmin() {
    try {
      await updateDoc(doc(db, "users", user.uid), { role: "admin" });
      addToast("Admin access granted. Reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      addToast("This account is not allowed to claim admin access.", "error");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-sand px-5">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream text-forest">
          <ShieldAlert size={26} />
        </span>
        <h1 className="mt-5 text-3xl">Staff only</h1>
        <p className="mt-2 text-sm text-muted">
          <b className="text-ink">{user.email}</b> does not have dashboard access yet. An admin can grant a role from Customers &amp; Team, or
          set <code className="rounded bg-sand px-1">role</code> to <code className="rounded bg-sand px-1">admin</code> on this user in Firestore.
        </p>
        <p className="mt-3 break-all rounded bg-sand px-3 py-2 font-mono text-xs text-muted">users/{user.uid}</p>
        <div className="mt-6 grid gap-2">
          <button onClick={claimAdmin} className="btn-dark">
            Claim admin access
          </button>
          <Link href="/" className="btn-outline">
            Back to store
          </Link>
          <button onClick={onLogout} className="text-sm text-muted link-underline">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { currentUser, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured && !loading && !currentUser) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, currentUser, router, pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!isFirebaseConfigured) return <SetupRequired />;
  if (loading || !currentUser) return <Loading />;

  const role = userProfile?.role;
  const handleLogout = () => logout().then(() => router.push("/"));

  if (!STAFF_ROLES.includes(role)) return <NoAccess user={currentUser} onLogout={handleLogout} />;

  const links = NAV.filter((item) => can(role, item.permission));
  const isActive = (href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const name = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || currentUser.email;

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-6 py-6">
        <LogoMark className="h-9 w-9 text-forest" />
        <span>
          <span className="block font-logo text-xl font-semibold leading-none">{STORE_NAME}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Dashboard</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive(href) ? "bg-forest text-white shadow-sm" : "text-ink/80 hover:bg-cream hover:text-forest"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/80 hover:bg-cream hover:text-forest">
          <ExternalLink size={18} /> View store
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/80 hover:bg-cream hover:text-forest">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside className="h-full w-72 animate-slideInLeft bg-white" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur md:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-deep">{role}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream font-semibold uppercase text-forest">{name.charAt(0)}</span>
          </div>
        </header>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
