import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Megaphone, Zap } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  ];

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 fixed top-16 left-0 bottom-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm text-gray-400 uppercase tracking-wider">Admin Console</span>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
