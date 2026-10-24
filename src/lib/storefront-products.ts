import { supabase } from "@/lib/supabase";
import type { StoreProduct } from "@/components/storefront/catalog";

// Fetch only public catalog fields. Never substitute sample inventory in production.
export async function storefrontProducts(): Promise<{ products: StoreProduct[]; catalogUnavailable: boolean }> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data, error, status } = await supabase.from("products")
            .select("*")
            .order("created_at", { ascending: false }).limit(200)
            .abortSignal(AbortSignal.timeout(attempt === 0 ? 8000 : 12000));
        if (error) {
            if (attempt === 0 && (status === 0 || status >= 500 || /fetch|timeout|abort|network/i.test(error.message))) continue;
            console.error("Storefront catalog unavailable:", error.code || "connection");
            return { products: [], catalogUnavailable: true };
        }
        const products = (data || []).filter(product => typeof product.name === "string" && typeof product.price_inr === "number" && Number.isFinite(product.price_inr) && product.price_inr >= 0)
            .map(product => ({ id: String(product.id), name: product.name, name_te: product.name_te, slug: product.slug,
                price_inr: product.price_inr, price_usd: product.price_usd, category: product.category,
                collection: product.collection, description: product.description, in_stock: product.in_stock === true,
                featured: product.featured === true, best_seller: product.best_seller === true,
                color: product.color, fabric: product.fabric, compare_at_price: product.compare_at_price,
                images: Array.isArray(product.images) ? product.images.filter((image: unknown): image is string => typeof image === "string") : [] })) as StoreProduct[];
        return { products, catalogUnavailable: false };
      } catch {
        if (attempt === 0) continue;
        console.error("Storefront catalog connection unavailable");
      }
    }
    return { products: [], catalogUnavailable: true };
}
