"use client";

import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { getUTMParams, trackEvent } from "@/lib/utm";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const total = getTotalPrice();

  const handleCheckout = async () => {
    setLoading(true);
    trackEvent("checkout_start", { value: total });
    const utm = getUTMParams();

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
          customerEmail: "guest@example.com",
          customerName: "Guest",
          shippingAddress: {},
          utmParams: utm,
          abVariant: "A",
        }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-purple-400/30 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Start shopping to add items here.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0 bg-purple-900/20">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-900/20" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                  <p className="text-purple-400 font-bold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 glass rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-2 hover:text-purple-400 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-2 font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-2 hover:text-purple-400 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400 hover:text-red-300 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-green-400">{total >= 999 ? "FREE" : formatPrice(99)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="gradient-text">{formatPrice(total >= 999 ? total : total + 99)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all hover-lift"
            >
              {loading ? "Redirecting..." : <><span>Proceed to Checkout</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 mt-3 glass text-gray-400 hover:text-white py-3 rounded-xl transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
