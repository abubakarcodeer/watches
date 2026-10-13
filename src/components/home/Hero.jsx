"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, RefreshCw, Truck } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useProducts } from "../../context/ProductContext";
import { IMAGES } from "../../data/images";
import { formatPrice } from "../../lib/config";
import BrandLogo, { hasBrandLogo } from "../ui/BrandLogo";

const PERKS = [
  { icon: Truck, title: "Free Shipping", text: "Worldwide" },
  { icon: BadgeCheck, title: "Authentic", text: "Brands" },
  { icon: CreditCard, title: "Secure", text: "Payments" },
  { icon: RefreshCw, title: "Easy", text: "Returns" },
];

// The last line of the headline is set in gold, as in "for Every Moment".
function Headline({ text }) {
  const lines = String(text).split("\n").filter(Boolean);
  if (lines.length < 2) return text;
  const last = lines.pop();
  const [lead, ...accent] = last.split(" ");
  return (
    <>
      {lines.map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
      <span className="block">
        {accent.length ? `${lead} ` : ""}
        <span className="text-gold">{accent.length ? accent.join(" ") : lead}</span>
      </span>
    </>
  );
}

export default function Hero() {
  const { heroEyebrow, heroTitle, heroSubtitle, heroImage } = useSettings();
  const { products } = useProducts();
  // Spotlight card: the priciest luxury piece in the catalogue.
  const featured = [...products].filter((p) => p.collection === "luxury" && p.category !== "accessories").sort((a, b) => b.price - a.price)[0] || products[0];

  return (
    <section className="relative isolate overflow-hidden bg-forest-deep text-white">
      <img src={heroImage || IMAGES.hero} alt="" className="absolute inset-y-0 right-0 -z-20 h-full w-full object-cover object-center md:w-[64%]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/40 md:from-[38%] md:via-forest-deep/70 md:via-[58%] md:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-forest-deep via-forest-deep/70 to-transparent" />

      <div className="container relative">
        <div className="max-w-[640px] animate-fadeUp pb-10 pt-14 md:pb-16 md:pt-20 lg:pt-24">
          <p className="eyebrow text-white/80">{heroEyebrow}</p>
          <h1 className="mt-4 text-[40px] font-medium leading-[1.12] sm:text-[52px] lg:text-[66px]">
            <Headline text={heroTitle} />
          </h1>
          <p className="mt-5 max-w-[440px] whitespace-pre-line text-[15px] leading-relaxed text-white/80 lg:text-base">{heroSubtitle}</p>
          <Link href="/shop" className="btn-gold mt-8 px-6 py-3.5">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>

        {featured && (
          <Link
            href={`/product/${featured.id}`}
            className="group absolute bottom-28 right-5 hidden w-[160px] rounded-xl border border-white/10 bg-night/85 p-4 backdrop-blur transition hover:border-gold/60 lg:block"
          >
            {hasBrandLogo(featured.brand) ? (
              <BrandLogo brand={featured.brand} tone="light" scale={0.9} className="-ml-2 -mt-1" />
            ) : (
              featured.brand && <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em]">{featured.brand}</p>
            )}
            <p className="mt-1.5 text-[11px] text-white/70">{featured.title.replace(`${featured.brand} `, "")}</p>
            <p className="mt-1 text-lg font-semibold">{formatPrice(featured.price)}</p>
            <span className="mt-3 grid h-7 w-7 place-items-center rounded-full bg-gold text-ink transition group-hover:translate-x-1">
              <ArrowRight size={14} />
            </span>
          </Link>
        )}

        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 py-7 md:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <Icon size={22} strokeWidth={1.5} className="shrink-0 text-gold" />
              <p className="text-[11.5px] leading-tight text-white/85">
                <span className="block font-medium text-white">{title}</span>
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
