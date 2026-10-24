"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { Product } from "@/types";

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    updateQuantity: (productId: string, quantity: number) => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("masna_cart") || "[]");
            if (Array.isArray(saved)) setCart(saved.filter((item): item is CartItem =>
                item && typeof item.id === "string" && typeof item.name === "string"
                && typeof item.price_inr === "number" && Number.isFinite(item.price_inr) && item.price_inr >= 0
                && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20
                && Array.isArray(item.images)
            ));
        } catch { /* An unavailable or damaged saved bag starts empty. */ }
        setLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (!loaded) return;
        try { localStorage.setItem("masna_cart", JSON.stringify(cart)); } catch { /* Keep shopping usable without browser storage. */ }
    }, [cart, loaded]);

    const addToCart = (product: Product) => {
        if (!product.in_stock) return;
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(20, item.quantity + 1) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (!Number.isFinite(quantity)) return;
        const next = Math.min(20, Math.max(0, Math.floor(quantity)));
        setCart(previous => next === 0 ? previous.filter(item => item.id !== productId)
            : previous.map(item => item.id === productId ? { ...item, quantity: next } : item));
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce(
        (acc, item) => acc + item.price_inr * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, cartCount, cartTotal }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
