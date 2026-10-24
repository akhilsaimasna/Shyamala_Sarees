import type { Product } from "@/types";

export type StoreProduct = Product & { color?: string; fabric?: string; compare_at_price?: number };
export const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const hasKnownPrice = (product: { price_inr: number }) => Number.isFinite(product.price_inr) && product.price_inr > 0;
export const priceLabel = (product: { price_inr: number }, quantity = 1) => hasKnownPrice(product) ? money(product.price_inr * quantity) : "Price on request";
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
  { name: "Yellow", hex: "#e5c33e" }, { name: "Orange", hex: "#dc793c" },
  { name: "Black", hex: "#292629" }, { name: "White", hex: "#faf8f3" },
  { name: "Grey", hex: "#939497" }, { name: "Brown", hex: "#80583f" },
];
export function productText(product: StoreProduct) {
  return [product.name, product.name_te, product.collection, product.category, product.description, product.colors?.join(" "), product.color, product.fabric].filter(Boolean).join(" ").toLowerCase();
}
export function matchesSearch(product: StoreProduct, query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const text = productText(product);
  return terms.every(term => text.includes(term));
}
export function matchesColour(product: StoreProduct, colour: string) {
  if (!colour) return true;
  if (product.colors?.length) return product.colors.some(value=>value.toLowerCase()===colour.toLowerCase());
  const text = product.color || [product.name, product.description].join(" ");
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).includes(colour.toLowerCase());
}
export const colourLabel = (product: StoreProduct) => product.colors?.length ? product.colors.join(", ") : product.color || "";
export const isNewArrival = (product: StoreProduct) => product.featured || product.collection?.toLowerCase().replace(/[ _]+/g,"-") === "new-arrivals";
export const collectionLabel = (product: StoreProduct) => (product.collection || product.category).replace(/[-_]/g," ").replace(/\b\w/g,letter=>letter.toUpperCase());
export function validImage(url: string | undefined): string | undefined {
  return url && (/^https?:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//"))) ? url : undefined;
}
export function filterCatalog(products: StoreProduct[], filters: { query: string; collections: string[]; colour: string; maxPrice: number; includeUnpriced?: boolean; inStock: boolean; edit: string; sort: string }) {
  const filtered = products.filter(product => {
    const text = productText(product);
    const collection = product.collection || product.category;
    return matchesSearch(product, filters.query)
      && (!filters.collections.length || filters.collections.includes(collection))
      && matchesColour(product, filters.colour)
      && (hasKnownPrice(product) ? product.price_inr <= filters.maxPrice : filters.includeUnpriced === true)
      && (!filters.inStock || product.in_stock)
      && (filters.edit !== "wedding" || /bridal|wedding|kanchi|banarasi|paithani/.test(text))
      && (filters.edit !== "new" || isNewArrival(product))
      && (filters.edit !== "budget" || (hasKnownPrice(product) && product.price_inr < 5000));
  });
  return filtered.sort((a,b) => filters.sort.startsWith("price-") && hasKnownPrice(a)!==hasKnownPrice(b) ? Number(hasKnownPrice(b))-Number(hasKnownPrice(a)) : filters.sort === "price-low" ? a.price_inr-b.price_inr : filters.sort === "price-high" ? b.price_inr-a.price_inr : filters.sort === "name" ? a.name.localeCompare(b.name) : Number(b.featured)-Number(a.featured));
}
export function enquiryHref(items: { name: string; id: string; price_inr: number; quantity: number }[], sample = false) {
  const lines = ["Hi Shyamala Sarees,", sample ? "I am exploring the storefront preview. Please suggest available sarees similar to these sample selections:" : "I would like to enquire about these sarees:", ...items.map(item => `${item.name} (${item.id}) × ${item.quantity} — ${priceLabel(item,item.quantity)}`), "", "Please confirm real photos/video, availability, final prices, shipping and payment details before I order."];
  return `https://wa.me/919440653443?text=${encodeURIComponent(lines.join("\n"))}`;
}
