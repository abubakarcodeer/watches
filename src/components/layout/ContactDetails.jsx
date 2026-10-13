"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { whatsappLink } from "../../data/pakistan";

// Everything here is edited from /admin/settings (Social & contact).
export default function ContactDetails() {
  const { contactEmail, contactPhone, contactAddress, whatsappNumber, deliveryTime } = useSettings();
  const whatsapp = whatsappLink(whatsappNumber, "Hello WatchShop, I have a question about");

  const cards = [
    contactEmail && { icon: Mail, title: "Email us", text: contactEmail, href: `mailto:${contactEmail}` },
    contactPhone && { icon: Phone, title: "Call us", text: contactPhone, href: `tel:${contactPhone.replace(/[^\d+]/g, "")}` },
    whatsapp && { icon: MessageCircle, title: "WhatsApp", text: "Chat with our team", href: whatsapp },
    contactAddress && { icon: MapPin, title: "Visit us", text: contactAddress },
    { icon: Clock, title: "Delivery", text: `Orders arrive in ${deliveryTime}` },
  ].filter(Boolean);

  return (
    <div className="container py-10 md:py-14">
      <div className="rounded-2xl bg-forest px-6 py-10 text-center text-white md:py-12">
        <p className="eyebrow text-gold">Get in Touch</p>
        <h1 className="mt-2 text-3xl md:text-[40px]">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75">Questions about a watch, an order or a return? We are happy to help.</p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {cards.map(({ icon: Icon, title, text, href }) => {
          const body = (
            <>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-cream text-forest">
                <Icon size={20} />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold">{title}</h2>
              <p className="mt-1 whitespace-pre-line break-words text-sm text-muted">{text}</p>
            </>
          );
          return (
            <li key={title}>
              {href ? (
                <a href={href} className="block h-full rounded-2xl border border-line p-6 transition hover:border-forest/30 hover:shadow-card">{body}</a>
              ) : (
                <div className="h-full rounded-2xl border border-line p-6">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-center text-sm text-muted">
        Looking for shipping, returns or warranty details? See the{" "}
        <Link href="/help" className="font-medium text-forest link-underline">Help Centre</Link>.
      </p>
    </div>
  );
}
