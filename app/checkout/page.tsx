"use client";

import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { Zap, CreditCard, Landmark, Truck, ShoppingBag, ArrowLeft, ArrowRight, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "COD">("CARD");
  
  // Form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  // Simulated Payment Inputs
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [upiId, setUpiId] = useState("");
  const [showUPIScreen, setShowUPIScreen] = useState(false);
  const [upiTimer, setUpiTimer] = useState(30);

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  // Load user details & default address if authenticated
  useEffect(() => {
    const user = session?.user;
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name || "",
        email: user.email || "",
      }));

      // Fetch saved addresses
      fetch("/api/account/addresses")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const def = data.find(a => a.isDefault) || data[0];
            setForm(f => ({
              ...f,
              line1: def.line1 || "",
              line2: def.line2 || "",
              city: def.city || "",
              state: def.state || "",
              postalCode: def.postalCode || "",
              country: def.country || "India",
            }));
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // UPI Timer Count
  useEffect(() => {
    let interval: any;
    if (showUPIScreen && upiTimer > 0) {
      interval = setInterval(() => setUpiTimer(t => t - 1), 1000);
    } else if (upiTimer === 0 && showUPIScreen) {
      submitOrder();
    }
    return () => clearInterval(interval);
  }, [showUPIScreen, upiTimer]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "UPI") {
      setShowUPIScreen(true);
      setUpiTimer(15); // Wait 15s to simulate scan, then auto-confirm
      return;
    }
    submitOrder();
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          customerName: form.name,
          customerEmail: form.email,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Clear Zustand cart
        clearCart();
        // Route directly to success with orderId parameter
        router.push(`/success?id=${data.orderId}`);
      } else {
        alert(data.error || "Order placement failed.");
      }
    } catch {
      alert("Failed to place order. Connection error.");
    } finally {
      setLoading(false);
      setShowUPIScreen(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-purple-400/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Link href="/products" className="text-purple-400 hover:underline mt-2 block">Go back to shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-2">
          <Zap className="text-purple-500 fill-purple-500" /> Secure One-Page Checkout
        </h1>

        {showUPIScreen ? (
          /* Simulated UPI Scan Overlay */
          <div className="max-w-md mx-auto glass rounded-3xl p-8 border border-purple-500/20 text-center animate-fade-in my-12">
            <h2 className="text-xl font-bold text-white mb-2">Scan & Pay</h2>
            <p className="text-xs text-gray-500 mb-6">Open your mobile UPI app (GPay, PhonePe, Paytm) and scan the QR code to complete payment of <span className="text-purple-400 font-bold">{formatPrice(total)}</span>.</p>
            
            <div className="w-48 h-48 bg-white mx-auto rounded-2xl p-4 flex items-center justify-center mb-6">
              {/* Simulated QR Code */}
              <div className="w-full h-full relative">
                <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=novadrop@oksbi%26am=100" alt="Simulated QR Code" fill className="object-contain" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-purple-400">Verifying transaction...</p>
              <p className="text-xs text-gray-500">Redirecting to order confirmation in {upiTimer}s.</p>
              <div className="w-32 h-1 bg-white/5 mx-auto rounded-full overflow-hidden mt-3">
                <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{ width: `${(upiTimer/15)*100}%` }} />
              </div>
            </div>

            <button
              onClick={submitOrder}
              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-xl text-xs"
            >
              Simulate Instant Confirmation
            </button>
          </div>
        ) : (
          /* Normal Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left side: Checkout Form */}
            <form onSubmit={handleCheckoutSubmit} className="lg:col-span-3 space-y-6">
              
              {/* Shipping Details */}
              <div className="glass rounded-3xl p-8 border border-white/5 space-y-4">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" /> Shipping Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={form.line1}
                      onChange={(e) => setForm({ ...form, line1: e.target.value })}
                      placeholder="123 Main St, Apartment 4B"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Mumbai"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">State / Region</label>
                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      placeholder="400001"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="India"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="glass rounded-3xl p-8 border border-white/5 space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" /> Select Payment Method
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "CARD", label: "Credit Card", icon: CreditCard },
                    { id: "UPI", label: "UPI / QR Code", icon: Landmark },
                    { id: "COD", label: "Cash on Delivery", icon: Truck }
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                          paymentMethod === method.id 
                            ? "bg-purple-600/10 border-purple-500 text-white" 
                            : "glass border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Forms based on selection */}
                {paymentMethod === "CARD" && (
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 animate-fade-in">
                    <div className="col-span-3">
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 font-mono tracking-widest focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="•••"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "UPI" && (
                  <div className="p-4 rounded-2xl bg-white/2 border border-white/5 animate-fade-in space-y-3">
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">UPI ID (Optional for QR code)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okaxis"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div className="p-4 rounded-2xl bg-white/2 border border-white/5 animate-fade-in">
                    <p className="text-xs text-gray-400 leading-relaxed">Pay in cash when order gets delivered. An additional logistics handling fee of ₹99 is waived for orders above ₹999.</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                  <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Your connection is SSL encrypted and personal data is secure.</span>
                </div>
              </div>
            </form>

            {/* Right side: Summary & Buy button */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Items */}
              <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Order Review</h3>
                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 py-3 items-center first:pt-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-900/20 relative overflow-hidden shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-purple-900/20" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                        {item.variant && <p className="text-[10px] text-gray-500">{item.variant}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <span className="text-xs font-bold text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Box */}
              <div className="glass rounded-3xl p-6 border border-white/5">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-400 font-bold" : ""}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-black text-base text-white">
                    <span>Grand Total</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-black py-4 rounded-xl transition-all hover-lift shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                  ) : (
                    <><span>Confirm & Place Order</span> <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <Link
                  href="/cart"
                  className="w-full flex items-center justify-center gap-1 mt-3 text-xs text-gray-500 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Cart
                </Link>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
