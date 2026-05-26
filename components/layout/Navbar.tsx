"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { ShoppingCart, Zap, Menu, X, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Navbar() {
  const { getTotalItems } = useCart();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = getTotalItems();
  const router = useRouter();

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Close search dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSuggestions(data);
          }
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:inline-block">NovaDrop</span>
          </Link>

          {/* Search Bar */}
          <div ref={dropdownRef} className="flex-grow max-w-md relative mx-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Search premium products..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-2 max-h-80 overflow-y-auto">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider px-3 py-1.5 border-b border-white/5">Matches Found</p>
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="w-10 h-10 bg-purple-900/20 rounded-lg relative overflow-hidden shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover" />
                      ) : (
                        <Zap className="w-4 h-4 text-purple-400 absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <span className="text-xs font-bold gradient-text shrink-0">₹{product.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/products?category=featured" className="text-sm text-gray-400 hover:text-white transition-colors">
              Featured
            </Link>
            {session?.user && (
              <Link href="/account" className="text-sm text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
            {(session?.user as { role?: string })?.role === "ADMIN" && (
              <Link href="/admin" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {session?.user ? (
              <button
                onClick={() => {
                  useCart.getState().clearCart();
                  signOut();
                }}
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
              {mounted && totalItems > 0 && (
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
              <Link href="/account" className="text-sm text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              {(session?.user as { role?: string })?.role === "ADMIN" && (
                <Link href="/admin" className="text-sm text-purple-400 hover:text-purple-300 font-bold" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={() => { useCart.getState().clearCart(); signOut(); setMobileOpen(false); }} className="text-sm text-gray-300 hover:text-white text-left">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
