/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { xl: "1240px" },
    },
    extend: {
      // Palette from the WatchShop design: deep forest green, warm gold, cream panels.
      colors: {
        ink: "#14201B",
        night: "#0C1512",
        cream: "#F6F0E4",
        sand: "#F6F6F3",
        muted: "#6B7570",
        line: "#E8E6DF",
        forest: { DEFAULT: "#0F3B2E", deep: "#0A2A20", soft: "#CFE0D8" },
        gold: { DEFAULT: "#DDAA55", deep: "#C7913A", soft: "#F4E4C3" },
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,32,27,.04), 0 8px 24px -12px rgba(20,32,27,.12)",
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        slideIn: { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
        slideInLeft: { from: { transform: "translateX(-100%)" }, to: { transform: "none" } },
      },
      animation: {
        fadeUp: "fadeUp .5s ease-out both",
        slideIn: "slideIn .35s cubic-bezier(.2,1,.3,1) both",
        slideInLeft: "slideInLeft .35s cubic-bezier(.2,1,.3,1) both",
      },
    },
  },
  plugins: [],
};
