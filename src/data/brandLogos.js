// Official brand logos, hot-linked from Wikimedia Commons (public-domain text logos; the marks remain
// trademarks of their owners). `height` is the display height in px that makes the wordmarks look the
// same size next to each other. For production, save copies under /public/brands and point `src` there.
const commons = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;

export const BRAND_LOGOS = {
  Rolex: { src: commons("thumb/f/f4/Logo_da_Rolex.png/500px-Logo_da_Rolex.png"), height: 64 },
  Omega: { src: commons("f/fb/Omega_Logo.svg"), height: 46 },
  Seiko: { src: commons("2/2c/Seiko_logo.svg"), height: 22 },
  Tissot: { src: commons("c/ce/Tissot_Logo.svg"), height: 40 },
  Casio: { src: commons("4/4d/Casio_logo.svg"), height: 21 },
  "Michael Kors": { src: commons("1/17/Michael_Kors_Logo.svg"), height: 13 },
  Citizen: { src: commons("5/51/Citizen_logo.svg"), height: 21 },
};
