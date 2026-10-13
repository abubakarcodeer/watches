import Link from "next/link";
import { STORE_NAME } from "../../lib/config";

// Round watch mark from the WatchShop logo, drawn as SVG so it stays crisp at any size.
export function LogoMark({ className = "", title }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} fill="none">
      {title && <title>{title}</title>}
      <path d="M14.5 7.5 15.6 3h8.8l1.1 4.5M14.5 32.5l1.1 4.500h8.8l1.1-4.500" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="12.2" stroke="currentColor" strokeWidth="2.6" />
      <path d="M20 13.200v7l4.400 2.800" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33.200 18v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ light = false, size = "md" }) {
  const lg = size === "lg";
  // "Watch" in ink, "Shop" in gold: split the name at its second capital.
  const [first, second = ""] = STORE_NAME.split(/(?=[A-Z][a-z]+$)/);
  return (
    <Link href="/" aria-label={`${STORE_NAME} home`} className="group flex items-center gap-2 leading-none">
      <LogoMark className={`shrink-0 ${light ? "text-white" : "text-forest"} ${lg ? "h-10 w-10" : "h-8 w-8 md:h-9 md:w-9"}`} />
      <span className={`font-logo font-semibold tracking-[-0.01em] ${light ? "text-white" : "text-ink"} ${lg ? "text-[28px]" : "text-[21px] md:text-[25px]"}`}>
        {first}
        <span className="text-gold-deep">{second}</span>
        <span className={`font-sans font-semibold tracking-normal ${lg ? "text-[13px]" : "text-[11px]"}`}>.com</span>
      </span>
    </Link>
  );
}
