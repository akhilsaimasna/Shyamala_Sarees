import Storefront from "@/components/storefront/Storefront";
import { storefrontProducts } from "@/lib/storefront-products";
export const dynamic = "force-dynamic";
export default async function ProductsPage() {
    const { products, catalogUnavailable } = await storefrontProducts();
    return <Storefront products={products} catalogUnavailable={catalogUnavailable} initiallyShopping />;
}
