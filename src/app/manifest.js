import { STORE_NAME } from "../lib/config";

export default function manifest() {
  return {
    name: STORE_NAME,
    short_name: STORE_NAME,
    description: "Premium watches for every moment.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0F3B2E",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
