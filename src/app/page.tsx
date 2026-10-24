import Storefront from "@/components/storefront/Storefront";
import { storefrontProducts } from "@/lib/storefront-products";
export const dynamic = "force-dynamic";
export default async function Home() {
    const products = await storefrontProducts();
    return <Storefront products={products} catalogUnavailable={products.length === 0} />;
}
