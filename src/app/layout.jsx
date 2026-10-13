import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Providers from "../components/Providers";
import SiteChrome from "../components/layout/SiteChrome";
import { getCatalogue } from "../lib/server/products";
import { SITE_URL, STORE_DOMAIN, STORE_NAME } from "../lib/config";
import { FB_PIXEL_ID } from "../lib/fpixel";

// Re-fetch the catalogue for server-rendered pages at most hourly; the client listener keeps it live after load.
export const revalidate = 3600;

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const logo = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-logo", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${STORE_DOMAIN} | Premium Watches for Every Moment`, template: `%s | ${STORE_NAME}` },
  description: "Shop authentic men's, women's, luxury and smart watches from Rolex, Omega, Seiko, Tissot, Casio and more. Free shipping, secure payments and easy returns.",
  openGraph: {
    locale: "en_US",
    siteName: STORE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({ children }) {
  const products = await getCatalogue();

  return (
    <html lang="en" className={`${sans.variable} ${logo.variable}`}>
      <body>
        {FB_PIXEL_ID && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        <Providers initialProducts={products}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
