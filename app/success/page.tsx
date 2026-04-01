import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="glass rounded-3xl p-12 glow">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Order Confirmed! 🎉</h1>
          <p className="text-gray-400 mb-8">
            Thank you for your purchase! You'll receive a confirmation email shortly.
            Your order is being processed.
          </p>
          <div className="glass rounded-xl p-4 mb-8 flex items-center gap-3">
            <Package className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-xs text-gray-500">2-5 business days</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-all hover-lift"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="glass text-gray-400 hover:text-white py-3 rounded-xl transition-all text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
