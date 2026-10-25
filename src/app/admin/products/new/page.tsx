"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { uploadProblem } from "@/lib/upload-validation";
import { colourOptions } from "@/components/storefront/catalog";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        name_te: "",
        price_inr: "",
        price_usd: "",
        compareAtPrice: "",
        category: "Silk",
        collection: "",
        description: "",
        colors: [] as string[],
        images: [] as string[],
        videos: [] as string[],
        in_stock: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setFormData({ ...formData, [target.name]: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const files = Array.from(e.target.files);
            for(const file of files){const problem=uploadProblem(file,"image");if(problem)throw new Error(problem);}
            const newImageUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                newImageUrls.push(data.publicUrl);
            }

            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image!');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        try {
            setUploadingVideo(true);
            const files = Array.from(e.target.files);
            for(const file of files){const problem=uploadProblem(file,"video");if(problem)throw new Error(problem);}
            const newVideoUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-videos')
                    .upload(fileName, file, { contentType: file.type });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('product-videos')
                    .getPublicUrl(fileName);

                newVideoUrls.push(data.publicUrl);
            }

            setFormData(prev => ({ ...prev, videos: [...prev.videos, ...newVideoUrls] }));
        } catch (error: unknown) {
            console.error('Error uploading video:', error);
            const errMsg = (error as { message?: string })?.message || JSON.stringify(error);
            alert(`Video upload failed:\n\n${errMsg}\n\nPlease check your Supabase "product-videos" bucket exists and is set to Public.`);
        } finally {
            setUploadingVideo(false);
        }
    };

    const removeVideo = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            videos: prev.videos.filter((_, index) => index !== indexToRemove)
        }));
    };

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.colors.length) { alert("Select at least one product colour shown in the photos."); return; }
        setLoading(true);

        try {
            const slug = generateSlug(formData.name);

            // Build payload — only include optional columns if they have values
            // This prevents crashes if the DB columns don't exist yet
            const payload: Record<string, unknown> = {
                name: formData.name,
                slug: slug,
                price_inr: parseFloat(formData.price_inr),
                price_usd: parseFloat(formData.price_usd),
                category: formData.category,
                description: formData.description,
                colors: formData.colors,
                images: formData.images,
                in_stock: formData.in_stock,
                featured: false,
                best_seller: false,
            };

            // Optional columns — only add if they have values
            if (formData.name_te) payload.name_te = formData.name_te;
            if (formData.collection) payload.collection = formData.collection;
            if (formData.compareAtPrice) payload.compare_at_price = parseFloat(formData.compareAtPrice);
            if (formData.videos.length > 0) payload.videos = formData.videos;

            const { error } = await supabase.from("products").insert(payload);

            if (error) throw error;

            alert("Product added successfully!");
            router.push("/admin/dashboard");
        } catch (error: unknown) {
            console.error("Error adding product:", error);
            const msg = error instanceof Error ? error.message : (error as { message?: string })?.message || JSON.stringify(error);
            alert(`Error saving product:\n\n${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 mb-6 inline-block">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Add New Product</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (English)</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telugu Name (Optional)</label>
                                <input
                                    type="text"
                                    name="name_te"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.name_te}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (INR)</label>
                                <input
                                    type="number"
                                    name="price_inr"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.price_inr}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Compare At Price (For Discounts)</label>
                                <input
                                    type="number"
                                    name="compareAtPrice"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary placeholder:text-gray-300"
                                    placeholder="Leave empty if no discount"
                                    value={formData.compareAtPrice}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                                <input
                                    type="number"
                                    name="price_usd"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.price_usd}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="Silk">Silk</option>
                                    <option value="Cotton">Cotton</option>
                                    <option value="Party Wear">Party Wear</option>
                                    <option value="Bridal">Bridal</option>
                                    <option value="Daily Wear">Daily Wear</option>
                                    <option value="Sarees">Sarees</option>
                                    <option value="Lehengas">Lehengas</option>
                                    <option value="Jewellery">Jewellery</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
                                <select
                                    name="collection"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.collection}
                                    onChange={handleChange}
                                >
                                    <option value="">None (General Category only)</option>
                                    <option value="new-arrivals">New Arrivals / Trending</option>
                                    <option value="best-sellers">Best Sellers</option>
                                    <option value="sale">On Sale Offers</option>
                                    <option value="gadwal-silk">Gadwal Silk</option>
                                    <option value="banarasi-silk">Banarasi Silk</option>
                                    <option value="kanchi-silk">Kanchi Silk</option>
                                    <option value="lehengas">Lehengas</option>
                                    <option value="jewellery">Jewellery</option>
                                </select>
                            </div>
                        </div>

                        <fieldset className="border border-gray-200 rounded-lg p-4">
                            <legend className="px-2 text-sm font-medium text-gray-700">Product colours (required)</legend>
                            <p className="text-xs text-gray-500 mb-3">Select the prominent fabric colours shown across your product photos. Include each colour variant; do not select Gold just for zari trim.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {colourOptions.map(option=><label key={option.name} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={formData.colors.includes(option.name)} onChange={()=>setFormData(current=>({...current,colors:current.colors.includes(option.name)?current.colors.filter(value=>value!==option.name):[...current.colors,option.name]}))}/>{option.name}</label>)}
                            </div>
                        </fieldset>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>

                            {/* Preview Grid */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <span className="text-gray-500 mb-2">
                                        {uploading ? "Uploading..." : "Click to upload images"}
                                    </span>
                                    <span className="text-xs text-gray-400">Select multiple files supported</span>
                                </label>
                            </div>
                        </div>

                        {/* VIDEO UPLOAD SECTION */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Videos <span className="text-gray-400 font-normal">(Optional — shows on product page)</span>
                            </label>

                            {formData.videos.length > 0 && (
                                <div className="flex flex-col gap-3 mb-4">
                                    {formData.videos.map((url, index) => (
                                        <div key={index} className="relative bg-black rounded-lg overflow-hidden border border-gray-200">
                                            <video src={url} controls className="w-full max-h-48 object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(index)}
                                                className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-md hover:bg-red-50 text-red-500 text-xs font-bold"
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center hover:bg-purple-50/30 transition-colors">
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={handleVideoUpload}
                                    disabled={uploadingVideo}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <span className="text-3xl">🎬</span>
                                    <span className="text-gray-600 font-medium">
                                        {uploadingVideo ? "Uploading video..." : "Click to upload a video"}
                                    </span>
                                    <span className="text-xs text-gray-400">MP4, MOV, WebM supported</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center mt-4">
                            <input
                                id="in_stock"
                                name="in_stock"
                                type="checkbox"
                                checked={formData.in_stock}
                                onChange={handleChange}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="in_stock" className="ml-2 block text-sm font-bold text-gray-900 cursor-pointer">
                                Item is currently in stock
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || uploading || formData.images.length === 0}
                                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
