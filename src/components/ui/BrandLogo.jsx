import { BRAND_LOGOS } from "../../data/brandLogos";

export const hasBrandLogo = (brand) => Boolean(BRAND_LOGOS[brand]);

// Brand logo in a single colour: ink on light backgrounds ("dark"), white on dark ones ("light").
// `hoverColor` reveals the brand's own colours when a parent with the `group` class is hovered.
// A brand without a logo file falls back to its name in type.
export default function BrandLogo({ brand, tone = "dark", scale = 1, hoverColor = false, className = "" }) {
  const logo = BRAND_LOGOS[brand];
  if (!logo) return <span className={`whitespace-nowrap text-lg font-semibold uppercase tracking-[0.08em] ${className}`}>{brand}</span>;
  return (
    <img
      src={logo.src}
      alt={brand}
      style={{ height: Math.round(logo.height * scale) }}
      className={`w-auto max-w-none brightness-0 transition duration-300 ${tone === "light" ? "invert" : "opacity-85"} ${
        hoverColor ? "group-hover:opacity-100 group-hover:brightness-100" : ""
      } ${className}`}
    />
  );
}
