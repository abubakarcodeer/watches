import { IMAGES } from "../../data/images";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid md:min-h-[calc(100vh-86px)] md:grid-cols-2">
      <div className="relative hidden bg-forest-deep md:block">
        <img src={IMAGES.auth} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-[380px]">
          <h1 className="text-[32px] leading-tight">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-outline w-full gap-3 disabled:opacity-50">
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      Continue with Google
    </button>
  );
}

export const authErrorMessage = (err) => {
  const code = err?.code || "";
  const msg = err?.message || "";
  if (msg === "EMAIL_NOT_VERIFIED") return "Please verify your email address before signing in.";
  if (code === "demo/unavailable") return "This needs Firebase. In demo mode only the admin login from .env.local works.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please try again in a few minutes.";
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "Incorrect email or password.";
  if (code.includes("user-not-found"))
    return "No account found with this email address.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("popup-closed")) return "Sign-in popup was closed.";
  return "Something went wrong. Please try again.";
};
