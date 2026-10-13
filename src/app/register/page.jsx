"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AuthShell, { authErrorMessage, GoogleButton } from "../../components/auth/AuthShell";

export default function RegisterPage() {
  const { signup, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function run(action) {
    setError("");
    setBusy(true);
    try {
      await action();
      addToast("Account created! Please check your email and verify your address before signing in.", "success", 10000);
      router.push("/login");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create Account" subtitle="Join WatchShop for early access to new arrivals and members-only deals.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => signup(form.email, form.password, form.firstName, form.lastName));
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="First name" className="field" value={form.firstName} onChange={set("firstName")} />
          <input required placeholder="Last name" className="field" value={form.lastName} onChange={set("lastName")} />
        </div>
        <input type="email" required placeholder="Email" className="field" value={form.email} onChange={set("email")} />
        <input type="password" required minLength={6} placeholder="Password (min. 6 characters)" className="field" value={form.password} onChange={set("password")} />
        {error && <p className="text-sm text-forest">{error}</p>}
        <button disabled={busy} className="btn-dark w-full">
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton disabled={busy} onClick={() => run(loginWithGoogle)} />
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink link-underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
