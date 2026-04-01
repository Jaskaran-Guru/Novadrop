import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Package } from "lucide-react";

async function getOrders() {
  try {
    return await prisma.order.findMany({
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    return [];
  }
}

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
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-purple-400">{order.id.slice(-8).toUpperCase()}</span>
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
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
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
