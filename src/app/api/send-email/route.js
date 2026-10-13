import { NextResponse } from "next/server";

const isConfigured = () =>
  Boolean(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY && process.env.ADMIN_EMAIL);

// Checkout is public, so throttle per IP to stop this route being used to spam the admin inbox.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const clip = (value, max = 500) => String(value ?? "").slice(0, max);

// Lets the dashboard show whether notifications are set up, without exposing any values.
export async function GET() {
  return NextResponse.json({ configured: isConfigured() });
}

export async function POST(request) {
  if (!isConfigured()) {
    return NextResponse.json({ success: false, skipped: true, error: "EmailJS is not configured" }, { status: 200 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    const { order } = await request.json();
    if (!order?.id) {
      return NextResponse.json({ success: false, error: "Missing order" }, { status: 400 });
    }

    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      ...(process.env.EMAILJS_PRIVATE_KEY ? { accessToken: process.env.EMAILJS_PRIVATE_KEY } : {}),
      template_params: {
        to_email: process.env.ADMIN_EMAIL,
        subject: `New WatchShop order ${clip(order.id, 40)}`,
        order_id: clip(order.id, 40),
        customer_name: clip(order.customer, 120),
        customer_email: clip(order.email, 120),
        customer_phone: clip(order.phone, 40),
        address: clip(order.address),
        items: clip(order.items, 2000),
        total: clip(order.total, 40),
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS error:", errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send email API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
