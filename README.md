# WatchShop.com

**Premium watches for every moment.** WatchShop is an online watch store built with Next.js and Firebase: a storefront for men's, women's, luxury and smart watches, plus a staff dashboard for products, orders, customers and store settings.

It runs out of the box in **demo mode** (sample catalogue, sample orders and a built-in admin login, all without Firebase) and switches to a live Firebase backend as soon as you add your project keys.

## Features

**Storefront**
- Homepage: hero with featured watch, shop by category, promo banners, best sellers, top brands, collection banner, featured collections, deals banner, latest arrivals, customer reviews, newsletter sign-up
- Shop listings by category (Men's, Women's, Smart, Accessories, Deals), collection (Classic, Sport, Luxury) and brand, with sorting
- Product pages with image gallery and zoom, colour and size options, rating, specifications, related products and Product structured data for SEO
- Live search in the header, wishlist, slide-out cart and checkout (Cash on Delivery)
- Customer accounts with order history, plus Brands, Contact and Help Centre pages
- Sitemap, robots.txt and web manifest generated automatically

**Admin dashboard** (`/admin`)
- Overview: revenue, orders, average order value, 14-day revenue chart, orders by status, best sellers and low-stock alerts
- Orders: status workflow (Pending → Confirmed → Shipped → Delivered / Cancelled) that adjusts stock, internal notes, WhatsApp contact, CSV export, printable shipping labels and abandoned checkouts
- Products: add and edit watches (brand, movement, collection, price, sale price, stock, rating, specifications, gallery images), toggle Best seller, New arrival and Visible
- Customers & Team: staff roles (admin, manager, confirmer)
- Subscribers: newsletter list with CSV export
- Settings: hero text and image, delivery charges, contact details and social links, all live on the store as soon as you save

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and React 19
- [Firebase](https://firebase.google.com): Authentication and Cloud Firestore
- [Tailwind CSS 3](https://tailwindcss.com), [lucide-react](https://lucide.dev) icons, Inter and Playfair Display fonts
- Optional: ImgBB (image uploads), EmailJS (new-order emails), Meta pixel, Vercel Analytics

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. With no Firebase keys the store runs in demo mode (see below).

```bash
npm run build
```

```bash
npm start
```

## Demo mode

While the Firebase keys in `.env.local` are empty:

- The store shows the sample catalogue from `src/data/products.js`.
- The dashboard has one account, the admin. Sign in at `/login` with the `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` values from `.env.local` (change them there whenever you like).
- Products, orders, settings and subscribers are stored in **your browser's local storage**, seeded with sample orders and customers. Another browser starts from the samples again; use **Reset demo data** in the dashboard banner to start over.
- Image uploads, customer registration, Google sign-in and password reset need Firebase. In the product form, paste an image URL instead of uploading.

The demo login is checked on the server (`src/app/api/demo-auth/route.js`), so the password never reaches the browser. It is **switched off automatically** as soon as the Firebase keys are set, so it cannot become a back door on the live store. To disable it earlier, leave `DEMO_ADMIN_PASSWORD` empty.

## Going live with Firebase

1. Create a project in the [Firebase console](https://console.firebase.google.com).
2. Enable **Authentication** with the Email/Password and Google providers, and create a **Cloud Firestore** database.
3. Add a web app (Project settings → Your apps) and copy its config into `.env.local` (start from `.env.example`). Restart the dev server.
4. Deploy the security rules in `firestore.rules`, either by pasting them in the console (Firestore → Rules) or with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:rules
   ```

5. Register at `/register` and verify your email.
6. Make that account an admin, either by setting `role` to `admin` on `users/{your uid}` in Firestore, or by adding your email to `bootstrapAdmins()` in `firestore.rules`, deploying, and clicking **Claim admin access** at `/admin`.
7. In the dashboard overview, click **Import sample catalogue** to start from the sample watches, or add your own.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | For live mode | Firebase web app config (API key, auth domain, project id, storage bucket, sender id, app id, measurement id) |
| `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` | Demo mode only | Dashboard login while Firebase is not connected |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public origin for canonical URLs and the sitemap |
| `IMGBB_API_KEY` | Optional | Image uploads from the dashboard |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `ADMIN_EMAIL` | Optional | Email alert for every new order |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Optional | Meta pixel tracking |

`.env.local` is git-ignored; never commit real keys.

## Project structure

```
src/
  app/                 Pages and API routes (App Router)
    admin/             Dashboard: overview, orders, products, customers, subscribers, settings
    api/               demo-auth, upload (ImgBB), send-email (EmailJS)
    shop/              /shop, /shop/category/[slug], /shop/collection/[slug], /shop/brand/[slug]
    product/[id]/      Product page
  components/
    home/              Homepage sections
    layout/            Header, search, cart drawer, footer, contact details
    product/           Product card, gallery, details, related carousel
    shop/              Listing and brand directory
    admin/             Dashboard UI, product form, image cropper, shipping labels
    ui/                Logo, brand logos, social icons
  context/             Auth, cart, wishlist, products, settings, toasts
  data/                Sample products, demo database, images, brand logos, Pakistan cities
  lib/
    config.js          Store name, currency, categories, collections, brands, navigation
    store.js           Data layer: Firestore when configured, browser storage in demo mode
    firebase.js        Firebase initialisation
    server/            Server-side catalogue reads
firestore.rules        Firestore security rules
```

## Customising

- **Store name, currency, categories, collections, brands, menu:** `src/lib/config.js`. Every price goes through `formatPrice`, so `CURRENCY` and `CURRENCY_SYMBOL` change the whole site.
- **Colours and fonts:** `tailwind.config.js` (forest green, gold, cream palette) and `src/app/layout.jsx`.
- **Homepage photography:** `src/data/images.js`. **Brand logos:** `src/data/brandLogos.js`.
- **Hero text, delivery charges, contact details and social links:** dashboard → Settings (no code needed).
- **Sample catalogue and demo data:** `src/data/products.js` and `src/data/demo.js`.

## Before launch

- **Checkout** is still the Pakistan Cash on Delivery flow (Pakistani mobile numbers and provinces, enforced by `firestore.rules`), while prices are shown in USD. Pick one market and align the currency, checkout form and rules.
- **Photography** is placeholder imagery hot-linked from Unsplash; replace it with your own product shots.
- **Brand logos** are hot-linked from Wikimedia Commons; copy them into `public/brands` and update `src/data/brandLogos.js`. The logos remain trademarks of their owners.
- **Customer reviews** on the homepage (`src/components/home/Testimonials.jsx`) and the **Help Centre policies** (`src/app/help/page.jsx`) are sample copy; replace them with real content.

## About

WatchShop.com: a Next.js and Firebase watch store with a full admin dashboard. Shop authentic men's, women's, luxury and smart watches from Rolex, Omega, Seiko, Tissot, Casio and more. Includes a built-in demo mode that runs without any backend.
