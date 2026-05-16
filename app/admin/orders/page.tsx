import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Package } from "lucide-react";
import { OrderActions } from "./OrderActions";

import { auth } from "@/auth";
import { getMockOrders } from "@/lib/demo-state";

async function getOrders() {
  const session = await auth();
  const adminId = session?.user?.id || "default_admin";
  const demoOrders = await getMockOrders(adminId);

  try {
    const dbOrders = await prisma.order.findMany({
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    
    
    const merged = [...dbOrders, ...demoOrders].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return merged.length > 0 ? merged : generateMockOrders();
  } catch {
    console.warn("DB Offline: Using order simulation mode.");
    return demoOrders.length > 0 ? demoOrders : generateMockOrders();
  }
}

const generateMockOrders = () => {
  const now = Date.now();
  return [
    {
      id: "mock_1a2b3c4d",
      customerName: "Jane Doe",
      customerEmail: "jane.demo@example.com",
      items: [{ product: { name: "Premium Wireless Earbuds Pro" } }],
      status: "PAID",
      total: 2999,
      utmSource: "facebook",
      createdAt: new Date(now - 1000 * 60 * 5).toISOString() 
    },
    {
      id: "mock_2b3c4d5e",
      customerName: "Arjun Mehta",
      customerEmail: "arjun.demo@example.com",
      items: [{ product: { name: "Minimalist Leather Wallet" } }],
      status: "PROCESSING",
      total: 799,
      utmSource: "instagram",
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString() 
    },
    {
      id: "mock_3c4d5e6f",
      customerName: "Sam Smith",
      customerEmail: "sam.demo@example.com",
      items: [{ product: { name: "Smart Fitness Tracker Band" } }],
      status: "SHIPPED",
      total: 1799,
      utmSource: "direct",
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString() 
    }
  ];
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-green-500/20 text-green-400",
  PROCESSING: "bg-blue-500/20 text-blue-400",
  SHIPPED: "bg-purple-500/20 text-purple-400",
  DELIVERED: "bg-green-600/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-400",
  REFUNDED: "bg-orange-500/20 text-orange-400",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-1">Orders</h1>
        <p className="text-gray-500">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
          <p className="text-gray-500">No orders yet. Run a test purchase to see data here.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-purple-400">{order.id.slice(-8).toUpperCase()}</span>
                    {order.id.startsWith("mock_") && (
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 font-bold text-[9px] rounded uppercase">Demo</span>
                    )}
                    <p className="text-[10px] text-gray-600 mt-0.5 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")} {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[order.status] || "bg-gray-500/20 text-gray-400"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold gradient-text">{formatPrice(order.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">{order.utmSource || "Direct"}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <OrderActions orderId={order.id} currentStatus={order.status} />
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
