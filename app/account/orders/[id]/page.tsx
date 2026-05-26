export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { OrderRefundForm } from "./OrderRefundForm";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  MapPin,
  RefreshCw,
  CreditCard,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "PENDING",    label: "Order Placed",        icon: Clock,         desc: "Your order has been received" },
  { key: "PAID",       label: "Payment Confirmed",   icon: CreditCard,    desc: "Payment successfully processed" },
  { key: "PROCESSING", label: "Processing",          icon: RefreshCw,     desc: "Being prepared at our warehouse" },
  { key: "SHIPPED",    label: "Shipped",             icon: Truck,         desc: "On its way to you" },
  { key: "DELIVERED",  label: "Delivered",           icon: CheckCircle2,  desc: "Successfully delivered" },
];

const STATUS_ORDER = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

const MOCK_ORDERS: Record<string, any> = {
  mock_1a2b3c4d: {
    id: "mock_1a2b3c4d",
    status: "PAID",
    total: 2999, subtotal: 2799, shipping: 200, tax: 0,
    customerName: "Jane Doe", customerEmail: "jane.demo@example.com",
    shippingAddress: { line1: "42 Demo Lane", city: "Mumbai", state: "MH", postalCode: "400001", country: "IN" },
    items: [{ id: "i1", quantity: 1, price: 2999, product: { name: "Premium Wireless Earbuds Pro", images: [] } }],
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  mock_2b3c4d5e: {
    id: "mock_2b3c4d5e",
    status: "SHIPPED",
    total: 799, subtotal: 699, shipping: 100, tax: 0,
    customerName: "Arjun Mehta", customerEmail: "arjun.demo@example.com",
    shippingAddress: { line1: "12 MG Road", city: "Bangalore", state: "KA", postalCode: "560001", country: "IN" },
    items: [{ id: "i2", quantity: 1, price: 799, product: { name: "Minimalist Leather Wallet", images: [] } }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  mock_3c4d5e6f: {
    id: "mock_3c4d5e6f",
    status: "DELIVERED",
    total: 1799, subtotal: 1599, shipping: 200, tax: 0,
    customerName: "Sam Smith", customerEmail: "sam.demo@example.com",
    shippingAddress: { line1: "8 Park Street", city: "Delhi", state: "DL", postalCode: "110001", country: "IN" },
    items: [{ id: "i3", quantity: 1, price: 1799, product: { name: "Smart Fitness Tracker Band", images: [] } }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  let order: any = null;

  if (id.startsWith("mock_")) {
    order = MOCK_ORDERS[id] ?? null;
  } else {
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: { include: { product: { select: { name: true, images: true } } } },
        },
      });
    } catch {
      order = MOCK_ORDERS[id] ?? null;
    }
  }

  if (!order) notFound();

  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const isRefunded  = order.status === "REFUNDED";
  const canRequest  = ["DELIVERED", "SHIPPED"].includes(order.status);
  const addr        = order.shippingAddress as any;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black mb-1">
              Order{" "}
              <span className="gradient-text font-mono">{id.slice(-8).toUpperCase()}</span>
              {id.startsWith("mock_") && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-normal">Demo</span>
              )}
            </h1>
            <p className="text-gray-500 text-sm">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCancelled && (
              <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Cancelled
              </span>
            )}
            {isRefunded && (
              <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-orange-500/20 text-orange-400">
                Refunded
              </span>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        {!isCancelled && !isRefunded && (
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="font-bold mb-6 text-xs text-gray-400 uppercase tracking-wider">Order Progress</h2>
            <div className="relative">
              {/* Track Line BG */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/5 hidden sm:block" />
              {/* Track Line Fill */}
              {currentStepIdx >= 0 && (
                <div
                  className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-purple-600 to-violet-400 hidden sm:block transition-all duration-1000"
                  style={{
                    width: `calc(${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}% - 0px)`,
                  }}
                />
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done   = idx <= currentStepIdx;
                  const active = idx === currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:w-28 sm:text-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0 ${
                          done
                            ? active
                              ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/40"
                              : "bg-purple-900/60 border-purple-600/60"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${done ? "text-purple-200" : "text-gray-600"}`}
                        />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${done ? "text-white" : "text-gray-600"}`}>
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-[10px] text-purple-400 mt-0.5 hidden sm:block">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items + Refund */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-4 text-xs text-gray-400 uppercase tracking-wider">Items Ordered</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.name ?? "Product"}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold gradient-text text-sm whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {canRequest && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold mb-1 text-xs text-gray-400 uppercase tracking-wider">
                  Request Return / Refund
                </h2>
                <p className="text-xs text-gray-600 mb-4">
                  Submit a request and our team will respond within 48 hours.
                </p>
                <OrderRefundForm orderId={id} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-4 text-xs text-gray-400 uppercase tracking-wider">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-4 text-xs text-gray-400 uppercase tracking-wider">Shipping To</h2>
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300 space-y-0.5">
                  <p>{addr?.line1}</p>
                  {addr?.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr?.city}, {addr?.state} {addr?.postalCode}
                  </p>
                  <p className="text-gray-500">{addr?.country}</p>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-3 text-xs text-gray-400 uppercase tracking-wider">Customer</h2>
              <p className="text-sm font-medium">{order.customerName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.customerEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
