import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

// Demo-mode admin login. It only exists while Firebase is NOT connected: as soon as the Firebase keys
// are in .env.local the real sign-in takes over and every handler below answers 404.
// The login itself lives in .env.local (DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD), never in client code.
const COOKIE = "watchshop_demo_admin";
const MAX_AGE = 60 * 60 * 12;

const firebaseConfigured = () => Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const credentials = () => ({ email: (process.env.DEMO_ADMIN_EMAIL || "").trim().toLowerCase(), password: process.env.DEMO_ADMIN_PASSWORD || "" });
const enabled = () => !firebaseConfigured() && Boolean(credentials().email && credentials().password);

const token = ({ email, password }) => createHmac("sha256", password).update(`demo-admin:${email}`).digest("hex");

const same = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

const disabled = () => NextResponse.json({ enabled: false, user: null }, { status: 404 });

// Brute-force guard: 8 attempts per IP per 10 minutes.
const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 8;
}

export async function GET(request) {
  if (!enabled()) return disabled();
  const creds = credentials();
  const signedIn = same(request.cookies.get(COOKIE)?.value || "", token(creds));
  return NextResponse.json({ enabled: true, user: signedIn ? { email: creds.email } : null });
}

export async function POST(request) {
  if (!enabled()) return disabled();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const creds = credentials();
  const ok = same(String(body.email || "").trim().toLowerCase(), creds.email) && same(body.password || "", creds.password);
  if (!ok) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  const response = NextResponse.json({ user: { email: creds.email } });
  response.cookies.set(COOKIE, token(creds), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ user: null });
  response.cookies.delete(COOKIE);
  return response;
}
