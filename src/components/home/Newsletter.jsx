"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase";
import { useToast } from "../../context/ToastContext";
import { IMAGES } from "../../data/images";

export default function Newsletter() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return addToast("Please enter a valid email", "error");
    if (!isFirebaseConfigured) return addToast("Connect Firebase to collect subscribers.", "error");
    setStatus("loading");
    try {
      await addDoc(collection(db, "subscribers"), { email: email.trim().toLowerCase(), createdAt: serverTimestamp() });
      setEmail("");
      setStatus("done");
      addToast("You're in! Watch your inbox for exclusive offers.");
    } catch (err) {
      console.error("Subscribe failed:", err);
      setStatus("idle");
      addToast("Could not subscribe right now. Please try again.", "error");
    }
  }

  return (
    <section id="newsletter" className="container scroll-mt-28 py-12 md:py-14">
      <div className="relative isolate overflow-hidden rounded-2xl bg-forest p-8 text-white md:p-11">
        <img src={IMAGES.newsletter} alt="" loading="lazy" className="absolute inset-y-0 right-0 -z-20 hidden h-full w-[48%] object-cover md:block" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-forest from-[52%] via-forest/75 via-[70%] to-forest/25 md:block" />

        <div className="max-w-[440px]">
          <p className="eyebrow text-white/70">Don't Miss Out</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight md:text-[32px]">Join Our Newsletter</h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">Get exclusive offers, new arrivals and special discounts straight to your inbox.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex overflow-hidden rounded-lg bg-white p-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={status === "done" ? "You are subscribed!" : "Enter your email address"}
              aria-label="Email address"
              className="min-w-0 flex-1 bg-transparent px-3.5 text-[13px] text-ink outline-none placeholder:text-muted"
            />
            <button type="submit" disabled={status === "loading"} className="btn-gold rounded-md px-5 py-2.5 text-[13px]">
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
