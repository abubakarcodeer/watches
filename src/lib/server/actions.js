"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidates the product page and sitemap.
 * Called from the admin dashboard when a product is created or updated.
 */
export async function revalidateProduct(id) {
  try {
    // Revalidate specific product page
    revalidatePath(`/product/${id}`);
    // Revalidate sitemap
    revalidatePath("/sitemap.xml");
    // Revalidate shop page (since it lists products)
    revalidatePath("/shop");
    // Revalidate home page (if it has bestsellers)
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Revalidation failed:", error);
    return { success: false, error: error.message };
  }
}
