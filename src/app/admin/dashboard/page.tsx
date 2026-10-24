"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";

export default function AdminDashboard() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        if (!isAdmin) {
            router.push("/admin");
        } else {
            setAuthorized(true);
            fetchProducts();
        }
    }, [router]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) setProducts(data as Product[]);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            // Refresh list
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    if (!authorized) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Product Dashboard</h1>
                    <Link
                        href="/admin/products/new"
                        className="bg-primary hover:bg-[#b5952f] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        + Add New Product
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Image</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Colours</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Price</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Stock</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">Loading products...</td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">No products found.</td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden">
                                                    {product.images?.[0] && (
                                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="p-4 text-gray-600">{product.category}</td>
                                            <td className="p-4 text-sm text-gray-600">{product.colors?.join(", ") || "Not set"}</td>
                                            <td className="p-4 text-gray-900">₹{product.price_inr.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-bold ${product.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {product.in_stock ? "In Stock" : "Out of Stock"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
