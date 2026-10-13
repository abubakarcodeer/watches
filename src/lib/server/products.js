import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { SEED_PRODUCTS } from "../../data/products";

const serialize = (id, data) =>
  JSON.parse(
    JSON.stringify({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null,
    })
  );

/**
 * Fetches all active products for sitemap and pre-rendering.
 * Note: Standard Firebase SDK works on the server in Next.js.
 */
export async function getActiveProducts() {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, "products"), where("isActive", "==", true), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => serialize(d.id, d.data()));
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

// Card-sized copy of the catalogue for the layout: it is embedded in every page's HTML, so the long
// text fields (only shown on the product page, which loads its own product) are left out.
export async function getCatalogue() {
  const products = await getActiveProducts();
  return products.map(({ description, longDescription, specs, ...card }) => card);
}

export async function getProductById(id) {
  // Sample catalogue pages keep working until the real product exists in Firestore.
  const seed = SEED_PRODUCTS.find((p) => p.id === id) || null;
  if (!isFirebaseConfigured) return seed;
  try {
    const snap = await getDoc(doc(db, "products", id));
    return snap.exists() ? serialize(snap.id, snap.data()) : seed;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return seed;
  }
}
