// Placeholder photography from Unsplash (free license). Swap for your own shoot.
const u = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const square = (id, w = 700) => `${u(id, w)}&h=${w}`;

export const IMAGES = {
  hero: u("photo-1629581678313-36cf745a9af9", 1600),
  auth: u("photo-1614164185128-e4ec99c436d7", 1200),
  categories: {
    mens: square("photo-1523170335258-f5ed11844a49"),
    womens: square("photo-1522312346375-d1a52e2b99b3"),
    smart: square("photo-1546868871-7041f2a55e12"),
    accessories: square("photo-1604242692760-2f7b0c26856d"),
    luxury: square("photo-1639006570490-79c0c53f1080"),
  },
  collections: {
    classic: square("photo-1542496658-e33a6d0d50f6"),
    sport: square("photo-1548171915-e79a380a2a4b"),
    luxury: square("photo-1541778480-fc1752bbc2a9"),
    smart: square("photo-1544117519-31a4b719223d"),
  },
  promoLuxury: u("photo-1587836374828-4dbafa94cf0e", 900),
  promoWomens: u("photo-1524592094714-0f0654e20314", 900),
  collectionBanner: u("photo-1490367532201-b9bc1dc483f6", 1100),
  deal: u("photo-1451290337906-ac938fc89bce", 1100),
  newsletter: u("photo-1524805444758-089113d48a6d", 1000),
  avatars: {
    james: square("photo-1500648767791-00dcc994a43e", 120),
    emily: square("photo-1494790108377-be9c29b29330", 120),
    ahmed: square("photo-1472099645785-5658abf4ff4e", 120),
  },
};

export { u as unsplash };
