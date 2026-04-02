import { CheckCircle, Package, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getMockOrders } from "@/lib/demo-state";
import { formatPrice } from "@/lib/utils";
import { auth } from "@/auth";

export default async function SuccessPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";
  const mockOrders = await getMockOrders(userId);
  const lastOrder = mockOrders[0];

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="glass rounded-3xl p-8 md:p-12 glow">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Order Confirmed! 🎉</h1>
          <p className="text-gray-400 mb-6 transition-all">
            Thank you for your purchase! Your order is being processed and will be shipped soon.
          </p>

          {/* Just Purchased Summary */}
          {lastOrder && (
            <div className="text-left mb-8 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Just Purchased</p>
              <div className="glass rounded-2xl p-4 border border-white/5 bg-white/2">
                {lastOrder.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-mono text-purple-400">{formatPrice(item.price)}</p>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-purple-500/20 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                  <span className="text-lg font-black text-white">{formatPrice(lastOrder.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/account"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all hover-lift pulse-glow"
            >
              View Your Orders <ShoppingBag className="w-4 h-4" />
            </Link>
            <Link href="/products" className="glass text-gray-400 hover:text-white py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
