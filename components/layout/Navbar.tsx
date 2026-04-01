"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { ShoppingCart, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { getTotalItems } = useCart();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = getTotalItems();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">NovaDrop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/products?category=featured" className="text-sm text-gray-400 hover:text-white transition-colors">
              Featured
            </Link>
            {session?.user && (
              <Link href="/account" className="text-sm text-gray-400 hover:text-white transition-colors">
                Orders
              </Link>
            )}
            {(session?.user as { role?: string })?.role === "ADMIN" && (
              <Link href="/admin" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <Link href="/products" className="text-sm text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Shop</Link>
          <Link href="/products?category=featured" className="text-sm text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Featured</Link>
          {session?.user ? (
            <>
              <Link href="/account" className="text-sm text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Orders</Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-sm text-gray-300 hover:text-white text-left">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
