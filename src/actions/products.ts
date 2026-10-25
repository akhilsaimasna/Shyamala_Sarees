import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export async function getProducts(category?: string, collectionSlug?: string, limit: number = 50): Promise<Product[]> {
    let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (category) {
        query = query.eq("category", category);
    }
    
    if (collectionSlug) {
        if (collectionSlug === 'new-arrivals') {
            // Already sorted by recently created, no strict db filter needed
        } else if (collectionSlug === 'best-sellers') {
            query = query.eq("best_seller", true);
        } else if (collectionSlug === 'sale') {
            // Check for discount presence
            query = query.not("compare_at_price", "is", null);
        } else {
            // Actual collection matching
            query = query.eq("collection", collectionSlug);
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return (data as Product[]) || [];
}

export async function getBestSellers(limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("best_seller", true)
        .limit(limit);

    if (error) {
        console.error("Error fetching best sellers:", error);
        return [];
    }

    return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(`Error fetching product with slug ${slug}:`, error);
        return null;
    }

    return data as Product;
}

export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    if (!query.trim()) return [];

    const literal = JSON.stringify(`%${query.trim().slice(0,120).replace(/[\\%_]/g, "\\$&")}%`);
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.${literal},category.ilike.${literal},description.ilike.${literal}`)
        .limit(limit);

    if (error) {
        console.error("Error searching products:", error);
        return [];
    }

    return (data as Product[]) || [];
}
