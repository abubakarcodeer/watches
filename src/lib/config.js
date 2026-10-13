export const STORE_NAME = "WatchShop";
export const STORE_DOMAIN = "WatchShop.com";
export const STORE_TAGLINE = "More Than Just Time";

// Canonical origin, used for canonicals, the sitemap and structured data.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.watchshop.com";

// Fallbacks for settings/store; admins override these from /admin/settings.
export const DEFAULT_SETTINGS = {
  announcement: "",
  freeShippingThreshold: 200,
  flatShipping: 15,
  heroEyebrow: "Timepieces for a better tomorrow",
  heroTitle: "Premium Watches\nfor Every Moment",
  heroSubtitle: "Discover timeless style, unmatched quality\nand the perfect watch for your lifestyle.",
  heroImage: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  contactEmail: "support@watchshop.com",
  contactPhone: "+1 (888) 123-4567",
  contactAddress: "New York, NY 10001\nUnited States",
  whatsappNumber: "",
  deliveryTime: "3–5 working days",
};

export const CATEGORIES = [
  { slug: "mens", name: "Men's Watches", audience: "Men's" },
  { slug: "womens", name: "Women's Watches", audience: "Women's" },
  { slug: "smart", name: "Smart Watches", audience: "Unisex" },
  { slug: "accessories", name: "Watch Accessories", audience: "Unisex" },
];

// Curated collections a product can belong to, on top of its category.
export const COLLECTIONS = [
  { slug: "classic", name: "Classic", tagline: "Timeless Elegance" },
  { slug: "sport", name: "Sport", tagline: "Built for Adventure" },
  { slug: "luxury", name: "Luxury", tagline: "For the Elite" },
];

export const BRANDS = ["Rolex", "Omega", "Seiko", "Tissot", "Casio", "Michael Kors", "Citizen"];

export const MOVEMENTS = ["Automatic", "Quartz", "Chronograph", "Solar", "Digital", "Smart", "Mechanical"];

export const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name || slug;

// "Automatic • Men's" line under a product title.
export const productMeta = (product) =>
  [product.movement, CATEGORIES.find((c) => c.slug === product.category)?.audience].filter(Boolean).join(" • ");

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  {
    href: "/shop/category/mens",
    label: "Men's Watches",
    children: [
      { href: "/shop/category/mens", label: "All Men's Watches" },
      ...COLLECTIONS.map((c) => ({ href: `/shop/collection/${c.slug}`, label: `${c.name} Collection` })),
    ],
  },
  { href: "/shop/category/womens", label: "Women's Watches" },
  { href: "/brands", label: "Brands" },
  { href: "/shop/category/accessories", label: "Accessories" },
  { href: "/shop/category/sale", label: "Deals" },
  { href: "/contact", label: "Contact" },
];

// Change these two to sell in another currency; every price on the site goes through formatPrice.
export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

export const LOW_STOCK_THRESHOLD = 5;

// Whole amounts, no cents: $8,250
export const formatPrice = (amount) => `${CURRENCY_SYMBOL}${Math.round(Number(amount) || 0).toLocaleString("en-US")}`;
