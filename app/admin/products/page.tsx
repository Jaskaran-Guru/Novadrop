"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inventory: number;
  active: boolean;
  featured: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", comparePrice: "",
    category: "", inventory: "10", featured: false, images: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        category: form.category,
        inventory: parseInt(form.inventory),
        featured: form.featured,
        images: form.images ? [form.images] : [],
        tags: [],
        active: true,
      }),
    });
    if (res.ok) {
      const product = await res.json();
      setProducts((prev) => [product, ...prev]);
      setForm({ name: "", slug: "", description: "", price: "", comparePrice: "", category: "", inventory: "10", featured: false, images: "" });
      setShowForm(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500 text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="text-gray-500">{products.length} products</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      
      {showForm && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6">New Product</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Product Name", placeholder: "e.g. Premium Wireless Earbuds" },
              { key: "slug", label: "Slug (auto-generated)", placeholder: "e.g. premium-wireless-earbuds" },
              { key: "price", label: "Price (₹)", type: "number", placeholder: "999" },
              { key: "comparePrice", label: "Compare Price (₹, optional)", type: "number", placeholder: "1499" },
              { key: "category", label: "Category", placeholder: "electronics" },
              { key: "inventory", label: "Inventory", type: "number", placeholder: "50" },
              { key: "images", label: "Image URL (optional)", placeholder: "https://..." },
            ].map(({ key, label, type = "text", placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as Record<string, string | boolean>)[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none"
                  {...(key === "price" || key === "inventory" ? { required: true } : {})}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Product description..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none resize-none"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-purple-600"
              />
              <label htmlFor="featured" className="text-sm text-gray-400">Mark as featured</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all"
              >
                {saving ? "Creating..." : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="glass text-gray-400 hover:text-white px-6 py-2 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      
      {products.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No products yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.featured && <span className="text-xs text-amber-400"> Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400 capitalize">{p.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold gradient-text">{formatPrice(p.price)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${p.inventory > 5 ? "text-green-400" : p.inventory > 0 ? "text-yellow-400" : "text-red-400"}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
