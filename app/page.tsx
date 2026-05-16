import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  Star,
  Shield,
  Truck,
  RefreshCw,
  TrendingUp,
  Zap,
  Users,
} from "lucide-react";
import Image from "next/image";
import { FALLBACK_PRODUCTS } from "@/lib/seed-data";

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, active: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
    return products.length > 0 ? products : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

async function getStats() {
  try {
    const [orderCount, productCount] = await Promise.all([
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.product.count({ where: { active: true } }),
    ]);
    return { orders: orderCount, products: productCount };
  } catch {
    return { orders: 2847, products: 48 };
  }
}

export default async function HomePage() {
  const [featuredProducts, stats] = await Promise.all([
    getFeaturedProducts(),
    getStats(),
  ]);

  const reviews = [
    { name: "Priya M.", rating: 5, text: "Lightning fast delivery! The quality blew me away. Will definitely buy again.", avatar: "PM" },
    { name: "Rohan K.", rating: 5, text: "Best D2C brand I've tried. The packaging alone makes it feel premium.", avatar: "RK" },
    { name: "Aarav S.", rating: 5, text: "ROAS on my first purchase was basically infinite — I'm a loyal customer now.", avatar: "AS" },
  ];

  return (
    <div className="min-h-screen">
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-[#0a0a0a] to-pink-950/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-purple-300 mb-8 fade-in">
            <TrendingUp className="w-4 h-4" />
            
          </div>

          
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 fade-in">
            Products Built for
            <br />
            <span className="gradient-text">Real Results</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 fade-in">
            Premium D2C products, rigorously tested through Meta Ads and real customer data.
            No middlemen. No fluff. Just quality that converts.
          </p>

          
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover-lift pulse-glow"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products?category=featured"
              className="inline-flex items-center gap-2 glass text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover-lift border border-white/10 hover:border-purple-500/50"
            >
              View Featured
            </Link>
          </div>

          
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto fade-in">
            <div className="text-center">
              <div className="text-3xl font-black gradient-text">{stats.orders.toLocaleString()}+</div>
              <div className="text-xs text-gray-500 mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black gradient-text">8x</div>
              <div className="text-xs text-gray-500 mt-1">Peak ROAS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black gradient-text">{stats.products}+</div>
              <div className="text-xs text-gray-500 mt-1">Products</div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Fast Shipping", desc: "Delivered in 2-5 business days" },
              { icon: Shield, title: "Quality Guarantee", desc: "30-day money-back promise" },
              { icon: RefreshCw, title: "Easy Returns", desc: "Hassle-free return process" },
              { icon: Zap, title: "Instant Support", desc: "24/7 customer service" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6 text-center hover-lift">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {featuredProducts.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="text-gray-500 mt-2">Highest converting picks, validated by real data</p>
              </div>
              <Link href="/products" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="glass rounded-2xl overflow-hidden hover-lift group">
                    <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-12 h-12 text-purple-400/30" />
                        </div>
                      )}
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                          -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold gradient-text">{formatPrice(product.price)}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Thousands</h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-gray-400 ml-2 text-sm">4.9/5 from 2,800+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.name} className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                    {review.avatar}
                  </div>
                  <span className="text-sm font-medium">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass rounded-3xl p-12 glow">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-4">Start Shopping Today</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of happy customers. Free shipping on orders over ₹999.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 hover-lift"
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-bold gradient-text">NovaDrop</span>
            </div>
            <p className="text-xs text-gray-600"> 2024 NovaDrop. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-xs text-gray-600 hover:text-gray-400">Privacy</Link>
              <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
