import type { Product } from "@/types";

export type StoreProduct = Product & { color?: string; fabric?: string; compare_at_price?: number };
export const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const weaves = [
  { name: "Kanchi silk", match: "kanchi", image: "kanchi-silk.png", subtitle: "An enduring classic" },
  { name: "Banarasi", match: "banarasi", image: "banarasi-silk.png", subtitle: "A little regal charm" },
  { name: "Gadwal silk", match: "gadwal", image: "gadwal-silk.png", subtitle: "Beautiful by tradition" },
  { name: "Georgette", match: "georgette", image: "georgette.png", subtitle: "Light on your feet" },
  { name: "Tissue silk", match: "tissue", image: "tissue-silk.png", subtitle: "For your golden hour" },
  { name: "Kalamkari", match: "kalamkari", image: "kalamkari.png", subtitle: "Art in every fold" },
];
export const colourOptions = [
  { name: "Maroon", hex: "#79283e" }, { name: "Pink", hex: "#d9a4ab" },
  { name: "Green", hex: "#497360" }, { name: "Blue", hex: "#345888" },
  { name: "Gold", hex: "#c8a453" }, { name: "Purple", hex: "#7d5888" },
  { name: "Red", hex: "#ba4141" }, { name: "Beige", hex: "#d1c5aa" },
];
export function productText(product: StoreProduct) {
  return [product.name, product.collection, product.category, product.description, product.color, product.fabric].filter(Boolean).join(" ").toLowerCase();
}
export function validImage(url: string | undefined): string | undefined {
  return url && (/^https?:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//"))) ? url : undefined;
}
export function filterCatalog(products: StoreProduct[], filters: { query: string; collections: string[]; colour: string; maxPrice: number; inStock: boolean; edit: string; sort: string }) {
  const terms = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = products.filter(product => {
    const text = productText(product);
    const collection = product.collection || product.category;
    return terms.every(term => text.includes(term))
      && (!filters.collections.length || filters.collections.includes(collection))
      && (!filters.colour || (product.color || product.name).toLowerCase().includes(filters.colour.toLowerCase()))
      && product.price_inr <= filters.maxPrice
      && (!filters.inStock || product.in_stock)
      && (filters.edit !== "wedding" || /bridal|wedding|kanchi|banarasi|paithani/.test(text))
      && (filters.edit !== "new" || product.featured)
      && (filters.edit !== "budget" || product.price_inr < 5000);
  });
  return filtered.sort((a,b) => filters.sort === "price-low" ? a.price_inr-b.price_inr : filters.sort === "price-high" ? b.price_inr-a.price_inr : filters.sort === "name" ? a.name.localeCompare(b.name) : Number(b.featured)-Number(a.featured));
}
export function enquiryHref(items: { name: string; id: string; price_inr: number; quantity: number }[], sample = false) {
  const lines = ["Hi Shyamala Sarees,", sample ? "I am exploring the storefront preview. Please suggest available sarees similar to these sample selections:" : "I would like to enquire about these sarees:", ...items.map(item => `${item.name} (${item.id}) × ${item.quantity} — ${money(item.price_inr * item.quantity)}`), "", "Please confirm real photos/video, availability, final prices, shipping and payment details before I order."];
  return `https://wa.me/919440653443?text=${encodeURIComponent(lines.join("\n"))}`;
}
