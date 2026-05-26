export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getMockOrders } from "@/lib/demo-state";
import { AccountDashboard } from "@/components/account/AccountDashboard";

async function getAccountOrders(userId: string) {
  const mockOrders = await getMockOrders(userId);
  
  try {
    const dbOrders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    
    const allOrders = [...mockOrders, ...dbOrders].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allOrders;
  } catch {
    return mockOrders; 
  }
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const userId = session.user.id;

  const [orders, addresses, user] = await Promise.all([
    getAccountOrders(userId),
    prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }).catch(() => []),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        savedPreferences: true,
      },
    }).catch(() => null),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Account Dashboard</h1>
            <p className="text-gray-500">Manage orders, profile details, shipping addresses, and security configurations.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium text-purple-400">{session.user.email}</p>
          </div>
        </div>

        <AccountDashboard 
          orders={orders} 
          initialAddresses={addresses} 
          user={user} 
        />
      </div>
    </div>
  );
}
