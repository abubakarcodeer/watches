"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AuthShell, { authErrorMessage, GoogleButton } from "../../components/auth/AuthShell";

export default function LoginPage() {
  const { login, loginWithGoogle, resetPassword, sendVerification } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [resending, setResending] = useState(false);

  async function run(action) {
    setError("");
    setUnverifiedUser(null);
    setBusy(true);
    try {
      await action();
      addToast("Welcome back!");
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/account");
    } catch (err) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setUnverifiedUser(err.user);
        setError("Your email address is not verified.");
      } else {
        setError(authErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!unverifiedUser) return;

    // Simple client-side rate limit: 3 attempts per session/window
    const attempts = Number(sessionStorage.getItem(`resend_${unverifiedUser.email}`) || 0);
    if (attempts >= 3) {
      return addToast("You have reached the limit for resending verification emails. Please try again later.", "error");
    }

    setResending(true);
    try {
      await sendVerification(unverifiedUser);
      sessionStorage.setItem(`resend_${unverifiedUser.email}`, attempts + 1);
      addToast("Verification email resent!");
    } catch (err) {
      addToast("Failed to resend email. Please try again later.", "error");
    } finally {
      setResending(false);
    }
  }

  async function handleReset() {
    setError("");
    if (!form.email) return setError("Enter your email above to reset your password.");

    // Simple client-side rate limit: 3 attempts per session/window
    const attempts = Number(sessionStorage.getItem(`reset_${form.email}`) || 0);
    if (attempts >= 3) {
      return setError("You have reached the limit for password reset attempts. Please try again later.");
    }

    setBusy(true);
    try {
      // Secure check using the dedicated index collection
      const email = form.email.toLowerCase().trim();
      const snap = await getDoc(doc(db, "email_indices", email));

      if (!snap.exists()) {
        setError("No account found with this email address.");
        return;
      }

      await resetPassword(form.email);
      sessionStorage.setItem(`reset_${form.email}`, attempts + 1);
      addToast("Password reset email sent");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign In" subtitle="Access your orders, wishlist and faster checkout.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => login(form.email, form.password));
        }}
        className="space-y-4"
      >
        <input type="email" required placeholder="Email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required placeholder="Password" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="flex justify-end">
          <button type="button" onClick={handleReset} className="text-xs link-underline">
            Forgot password?
          </button>
        </div>
        {error && (
          <div className="rounded-lg bg-forest/5 p-3 text-sm text-forest border border-forest/10">
            <p>{error}</p>
            {unverifiedUser && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="mt-2 block font-semibold underline decoration-forest/30 underline-offset-2 hover:text-forest-deep"
              >
                {resending ? "Resending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}
        <button disabled={busy} className="btn-dark w-full">
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton disabled={busy} onClick={() => run(loginWithGoogle)} />
      <p className="mt-8 text-center text-sm text-muted">
        New to WatchShop?{" "}
        <Link href="/register" className="font-semibold text-ink link-underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
