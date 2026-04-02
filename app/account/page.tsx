export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Package, XCircle, ShoppingBag } from "lucide-react";
import { RefundButton } from "@/app/account/RefundButton";

import { getMockOrders } from "@/lib/demo-state";

async function getAccountOrders(userId: string) {
  const mockOrders = await getMockOrders(userId);
  
  try {
    const dbOrders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    
    // Merge real orders with mock orders
    const allOrders = [...mockOrders, ...dbOrders].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allOrders;
  } catch {
    return mockOrders; // Fallback to just mock orders if DB is offline
  }
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const userId = session.user.id;
  const orders = await getAccountOrders(userId);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Your Orders</h1>
            <p className="text-gray-500">View and manage your purchase history.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium text-purple-400">{session.user.email}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't made any purchases yet.</p>
            <a 
              href="/products" 
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-purple-400 uppercase">Order #{order.id.slice(-8)}</p>
                      <h3 className="font-bold text-lg">{formatPrice(order.total)}</h3>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    {order.status === 'PENDING' && (
                      <RefundButton orderId={order.id} />
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item: any, idx: number) => (
                      <span key={idx} className="bg-white/5 px-2 py-1 rounded-md text-xs text-gray-300">
                        {item.product.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
