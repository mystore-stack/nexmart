"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Eye, EyeOff, Plus, X, Search, ArrowUp, ArrowDown, Star } from "lucide-react";
import toast from "react-hot-toast";

const homepageConfigSchema = z.object({
  featuredCategories: z.array(z.string()),
  featuredProducts: z.array(z.string()),
  featuredBrands: z.array(z.string()),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    avatarUrl: z.string().optional(),
    rating: z.number().min(1).max(5),
    content: z.string(),
  })),
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().optional(),
  newsletterSubtitle: z.string().optional(),
  isActive: z.boolean().default(true),
});

type HomepageConfigFormData = z.infer<typeof homepageConfigSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
}

export default function HomepageCMSPage() {
  const [config, setConfig] = useState<HomepageConfigFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HomepageConfigFormData>({
    resolver: zodResolver(homepageConfigSchema),
    defaultValues: {
      featuredCategories: [],
      featuredProducts: [],
      featuredBrands: [],
      testimonials: [],
      newsletterEnabled: true,
      isActive: true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchConfig();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/homepage");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        reset(data.config);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products?limit=50");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleSave = async (data: HomepageConfigFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: config ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (responseData.success) {
        setConfig(responseData.config);
        toast.success("Homepage configuration saved!");
      } else {
        toast.error(responseData.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const current = watchedValues.featuredCategories || [];
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    setValue("featuredCategories", updated);
  };

  const toggleProduct = (productId: string) => {
    const current = watchedValues.featuredProducts || [];
    const updated = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    setValue("featuredProducts", updated);
  };

  const addBrand = (brand: string) => {
    const current = watchedValues.featuredBrands || [];
    if (!current.includes(brand)) {
      setValue("featuredBrands", [...current, brand]);
    }
  };

  const removeBrand = (brand: string) => {
    const current = watchedValues.featuredBrands || [];
    setValue("featuredBrands", current.filter(b => b !== brand));
  };

  const addTestimonial = () => {
    const current = watchedValues.testimonials || [];
    setValue("testimonials", [
      ...current,
      { name: "", role: "", avatarUrl: "", rating: 5, content: "" },
    ]);
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const current = watchedValues.testimonials || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("testimonials", updated);
  };

  const removeTestimonial = (index: number) => {
    const current = watchedValues.testimonials || [];
    setValue("testimonials", current.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage homepage sections and content</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary py-2 px-4"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
          <button
            onClick={handleSubmit(handleSave)}
            disabled={saving}
            className="btn-primary py-2 px-4"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        {/* Featured Categories */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Featured Categories</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories
              .filter(c => c.name.toLowerCase().includes(searchCategory.toLowerCase()))
              .map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    watchedValues.featuredCategories?.includes(category.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium truncate">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.slug}</p>
                </button>
              ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Selected: {watchedValues.featuredCategories?.length || 0} categories
          </p>
        </div>

        {/* Featured Products */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products
              .filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()))
              .map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    watchedValues.featuredProducts?.includes(product.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
                </button>
              ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Selected: {watchedValues.featuredProducts?.length || 0} products
          </p>
        </div>

        {/* Featured Brands */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Featured Brands</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add brand name..."
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBrand(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add brand name..."]') as HTMLInputElement;
                if (input?.value) {
                  addBrand(input.value);
                  input.value = "";
                }
              }}
              className="btn-secondary px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchedValues.featuredBrands?.map((brand) => (
              <div
                key={brand}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary rounded-lg"
              >
                <span>{brand}</span>
                <button
                  type="button"
                  onClick={() => removeBrand(brand)}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Testimonials</h2>
            <button
              type="button"
              onClick={addTestimonial}
              className="btn-secondary py-2 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </button>
          </div>
          <div className="space-y-4">
            {watchedValues.testimonials?.map((testimonial, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Testimonial {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <input
                      type="text"
                      value={testimonial.role || ""}
                      onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avatar URL</label>
                  <input
                    type="text"
                    value={testimonial.avatarUrl || ""}
                    onChange={(e) => updateTestimonial(index, "avatarUrl", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateTestimonial(index, "rating", star)}
                        className={`p-1 ${testimonial.rating >= star ? "text-yellow-500" : "text-gray-300"}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={testimonial.content}
                    onChange={(e) => updateTestimonial(index, "content", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Newsletter Section</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("newsletterEnabled")}
                className="w-4 h-4 rounded border-border"
              />
              <label className="text-sm font-medium">Enable Newsletter Section</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                {...register("newsletterTitle")}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Subscribe to our newsletter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                {...register("newsletterSubtitle")}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Get the latest updates and offers"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
