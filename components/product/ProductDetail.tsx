"use client";

import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/utm";
import { ShoppingCart, Plus, Minus, Zap, Star, Check } from "lucide-react";
import Image from "next/image";

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
  variants: { id: string; name: string; value: string; price: number | null }[];
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant || "default"}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      quantity,
      variant: selectedVariant || undefined,
    });

    trackEvent("add_to_cart", {
      productId: product.id,
      value: product.price * quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images */}
      <div className="space-y-4">
        <div className="aspect-square glass rounded-2xl overflow-hidden relative">
          {product.images[selectedImage] ? (
            <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-20 h-20 text-purple-400/20" />
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === selectedImage ? "border-purple-500" : "border-transparent glass"
                }`}
              >
                <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-6 pt-4">
        <div>
          <p className="text-sm text-purple-400 uppercase tracking-wider mb-2">{product.category}</p>
          <h1 className="text-3xl font-black mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-gray-500">(128 reviews)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black gradient-text">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                <span className="bg-red-500/20 text-red-400 text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              </>
            )}
          </div>
        </div>

        <p className="text-gray-400 leading-relaxed">{product.description}</p>

        {/* Variants */}
        {product.variants.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Select Option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedVariant === v.value
                      ? "bg-purple-600 text-white"
                      : "glass text-gray-400 hover:text-white"
                  }`}
                >
                  {v.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-gray-300">Quantity</p>
          <div className="flex items-center glass rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:text-purple-400 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
              className="p-3 hover:text-purple-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">{product.inventory} in stock</span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.inventory === 0 || added}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-all duration-200 ${
            added
              ? "bg-green-600 text-white"
              : product.inventory === 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white hover-lift pulse-glow"
          }`}
        >
          {added ? (
            <><Check className="w-5 h-5" /> Added to Cart!</>
          ) : (
            <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
          )}
        </button>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
          {["Free Shipping", "30-Day Return", "Secure Payment"].map((badge) => (
            <div key={badge} className="text-center">
              <Check className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{badge}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
