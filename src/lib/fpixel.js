import { CURRENCY as STORE_CURRENCY } from "./config";

// Set NEXT_PUBLIC_FB_PIXEL_ID to load the Meta pixel; without it every call below is a no-op.
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";
export const CURRENCY = STORE_CURRENCY;

// No-op when the pixel isn't loaded (ad blockers, SSR) so tracking can never break the page.
const fbq = (...args) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq(...args);
};

export const pageview = () => {
  fbq('track', 'PageView');
};

// https://developers.facebook.com/docs/facebook-pixel/reference
// Pass { eventID } so Meta can de-duplicate the event if it is also sent through the Conversions API.
export const event = (name, options = {}, meta) => {
  if (meta) fbq('track', name, options, meta);
  else fbq('track', name, options);
};
