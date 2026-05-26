"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  X,
  Check,
  Loader2,
  FolderOpen
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  inventory: number;
  active: boolean;
  featured: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    inventory: "10",
    featured: false,
    images: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      // Fetch all products by omitting active filter (since the default public GET route has active: true,
      // let's fetch without active filter or fetch all. Let's check how the public GET route works.
      // Ah, the public API route has "where: { active: true }".
      // Wait, let's make sure the admin can fetch ALL products including inactive ones!
      // Let's check if the admin wants to fetch all. We can add a parameter or build an admin-specific products API,
      // or check if there is an admin-specific endpoint. Let's see: we can call GET /api/products?admin=true or similar.
      // Let's modify app/api/products/route.ts to allow admin to bypass the active filter!)
      const r = await fetch("/api/products?admin=true");
      const data = await r.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update form fields when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        slug: editingProduct.slug,
        description: editingProduct.description,
        price: editingProduct.price.toString(),
        comparePrice: editingProduct.comparePrice?.toString() || "",
        category: editingProduct.category,
        inventory: editingProduct.inventory.toString(),
        featured: editingProduct.featured,
        images: editingProduct.images?.[0] || "",
      });
      setShowForm(true);
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        price: "",
        comparePrice: "",
        category: "",
        inventory: "10",
        featured: false,
        images: "",
      });
    }
  }, [editingProduct]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: form.description,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      category: form.category.toLowerCase().trim(),
      inventory: parseInt(form.inventory),
      featured: form.featured,
      images: form.images ? [form.images] : [],
      active: editingProduct ? editingProduct.active : true,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedProd = await res.json();
        if (editingProduct) {
          setProducts((prev) => prev.map((p) => (p.id === savedProd.id ? savedProd : p)));
        } else {
          setProducts((prev) => [savedProd, ...prev]);
        }
        
        // Reset form
        setShowForm(false);
        setEditingProduct(null);
        setForm({
          name: "",
          slug: "",
          description: "",
          price: "",
          comparePrice: "",
          category: "",
          inventory: "10",
          featured: false,
          images: "",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Something went wrong saving the product");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save product due to connection issue");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    // Optimistic Update
    const updatedStatus = !product.active;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: updatedStatus } : p))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedStatus }),
      });
      if (!res.ok) {
        // Revert
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, active: product.active } : p))
        );
      }
    } catch {
      // Revert
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: product.active } : p))
      );
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const updatedFeatured = !product.featured;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, featured: updatedFeatured } : p))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: updatedFeatured }),
      });
      if (!res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: product.featured } : p))
        );
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, featured: product.featured } : p))
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to permanently delete this product? This action is irreversible.")) return;

    // Optimistic Update
    const originalProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setProducts(originalProducts);
      }
    } catch {
      setProducts(originalProducts);
    }
  };

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-400 text-sm">Synchronizing live product catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1">Product Catalog</h1>
          <p className="text-gray-500">Add, edit, feature, or temporarily archive store products.</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(!showForm);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {showForm && !editingProduct ? (
            <>
              <X className="w-4 h-4" /> Close Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Product
            </>
          )}
        </button>
      </div>

      {/* Form (Add or Edit Product) */}
      {showForm && (
        <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-600 to-indigo-600" />
          <div className="flex justify-between items-center mb-6 pl-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {editingProduct ? `Edit "${editingProduct.name}"` : "Create New Product"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-2">
            {[
              { key: "name", label: "Product Name", placeholder: "e.g. Premium Wireless Earbuds Pro", required: true },
              { key: "slug", label: "Slug URL (optional)", placeholder: "e.g. premium-wireless-earbuds-pro" },
              { key: "price", label: "Selling Price (₹)", type: "number", placeholder: "2999", required: true },
              { key: "comparePrice", label: "Original Compare Price (₹, optional)", type: "number", placeholder: "4999" },
              { key: "category", label: "Category", placeholder: "electronics", required: true },
              { key: "inventory", label: "Stock Inventory", type: "number", placeholder: "50", required: true },
              { key: "images", label: "Single Image URL (optional)", placeholder: "https://images.unsplash.com/..." },
            ].map(({ key, label, type = "text", placeholder, required = false }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as Record<string, string | boolean>)[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
              <textarea
                rows={3}
                placeholder="Write a compelling description for this item..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-white/10 accent-purple-600 bg-white/5 cursor-pointer"
              />
              <label htmlFor="featured" className="text-sm text-gray-400 font-medium cursor-pointer select-none">
                Promote to Featured (homepage hero slot)
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="glass text-gray-300 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving Changes..." : editingProduct ? "Save Changes" : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search catalog by name, category, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-purple-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 bg-transparent outline-none focus:border-purple-500/30 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-950 text-white capitalize">
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      {filteredProducts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <Package className="w-12 h-12 text-purple-500/20 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No matches found in your inventory.</p>
          <p className="text-xs text-gray-600 mt-1">Try resetting search filters or add a new product.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Showcase</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                    {/* Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-white truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-400 font-medium capitalize">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-purple-300">{formatPrice(p.price)}</span>
                        {p.comparePrice && (
                          <span className="text-[10px] text-gray-600 line-through">
                            {formatPrice(p.comparePrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold ${
                          p.inventory > 10
                            ? "text-green-400"
                            : p.inventory > 0
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {p.inventory} units
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          p.featured
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10"
                        }`}
                      >
                        <Sparkles className={`w-3 h-3 ${p.featured ? "fill-amber-400" : ""}`} />
                        {p.featured ? "Featured" : "Standard"}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-lg border transition-all ${
                          p.active
                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                        }`}
                      >
                        {p.active ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Archived
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          title="Edit Product"
                          className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Delete Product"
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
