import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Zap, Filter, ArrowUpDown, Star, RotateCcw } from "lucide-react";
import { FALLBACK_PRODUCTS } from "@/lib/seed-data";
import { SortSelector, PriceRangeFilter } from "@/components/products/FilterControls";

async function getProducts(
  category?: string, 
  search?: string, 
  sortBy?: string, 
  priceMin?: number, 
  priceMax?: number, 
  rating?: number, 
  inStockOnly?: boolean
) {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category && category !== "all" && category !== "featured"
          ? { category }
          : {}),
        ...(category === "featured" ? { featured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        price: {
          ...(priceMin ? { gte: priceMin } : {}),
          ...(priceMax ? { lte: priceMax } : {}),
        },
        ...(inStockOnly ? { inventory: { gt: 0 } } : {}),
      },
      include: {
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: {
        ...(sortBy === "price_asc" ? { price: "asc" } : {}),
        ...(sortBy === "price_desc" ? { price: "desc" } : {}),
        ...(sortBy === "newest" || !sortBy ? { createdAt: "desc" } : {}),
        ...(sortBy === "popular" ? { featured: "desc" } : {}),
      },
    });

    // Filter by average rating in-memory if rating threshold provided
    let results: any[] = products.length > 0 ? (products as any[]) : (FALLBACK_PRODUCTS as any[]);
    
    if (rating && rating > 0) {
      results = results.filter((p: any) => {
        if (!p.reviews || p.reviews.length === 0) return rating <= 3; // Unrated fallback
        const avg = p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length;
        return avg >= rating;
      });
    }

    return results;
  } catch {
    return FALLBACK_PRODUCTS as any[];
  }
}

async function getCategories() {
  try {
    const result = await prisma.product.groupBy({
      by: ["category"],
      where: { active: true },
    });
    return result.map((r: any) => r.category);
  } catch {
    return ["electronics", "accessories", "tech", "fitness"];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    search?: string;
    sortBy?: string;
    priceMin?: string;
    priceMax?: string;
    rating?: string;
    inStockOnly?: string;
  }>;
}) {
  const params = await searchParams;
  const currentCategory = params.category || "all";
  const currentSearch = params.search || "";
  const currentSortBy = params.sortBy || "newest";
  const priceMin = params.priceMin ? parseFloat(params.priceMin) : undefined;
  const priceMax = params.priceMax ? parseFloat(params.priceMax) : undefined;
  const rating = params.rating ? parseInt(params.rating) : undefined;
  const inStockOnly = params.inStockOnly === "true";

  const [products, categories] = await Promise.all([
    getProducts(
      currentCategory, 
      currentSearch, 
      currentSortBy, 
      priceMin, 
      priceMax, 
      rating, 
      inStockOnly
    ),
    getCategories(),
  ]);

  // Build query URL helper
  const getQueryUrl = (updates: Record<string, string | number | boolean | undefined | null>) => {
    const combined = {
      category: currentCategory,
      search: currentSearch || undefined,
      sortBy: currentSortBy,
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
      rating: rating || undefined,
      inStockOnly: inStockOnly ? "true" : undefined,
      ...updates
    };
    
    const searchParamsObj = new URLSearchParams();
    Object.entries(combined).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParamsObj.set(key, String(val));
      }
    });
    
    return `/products?${searchParamsObj.toString()}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-2">
              <Zap className="text-purple-500 w-8 h-8 fill-purple-500" />
              {currentCategory === "featured" ? "Featured Picks" : "Catalog Discovery"}
            </h1>
            <p className="text-gray-500 text-sm">
              Displaying {products.length} premium products {currentSearch && `matching "${currentSearch}"`}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Sort By:</span>
            <SortSelector currentSortBy={currentSortBy} getQueryUrl={getQueryUrl} />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/5">
          <Filter className="w-4 h-4 text-purple-400 shrink-0" />
          {["all", "featured", ...categories].map((cat) => (
            <Link
              key={cat}
              href={cat === "all" ? "/products" : `/products?category=${cat}`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                currentCategory === cat
                  ? "bg-purple-600 text-white"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <aside className="col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="glass rounded-3xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-400" /> Filters
                </h3>
                {(priceMin || priceMax || rating || inStockOnly) && (
                  <Link
                    href={`/products?category=${currentCategory}`}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </Link>
                )}
              </div>

              {/* Price Ranges */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price Range</p>
                <PriceRangeFilter priceMin={priceMin} priceMax={priceMax} getQueryUrl={getQueryUrl} />
              </div>

              {/* Ratings */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Minimum Rating</p>
                <div className="flex flex-col gap-2">
                  {[4, 3, 2].map((r) => (
                    <Link
                      key={r}
                      href={getQueryUrl({ rating: rating === r ? undefined : r })}
                      className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-all ${
                        rating === r 
                          ? "bg-purple-600/20 border border-purple-500/30 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r ? "fill-amber-400 text-amber-400" : "text-gray-700"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs">& Up</span>
                      </div>
                      <span className="text-[10px] text-gray-500">{(r).toFixed(1)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stock availability */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Availability</p>
                <Link
                  href={getQueryUrl({ inStockOnly: !inStockOnly ? "true" : undefined })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    inStockOnly 
                      ? "bg-purple-600/10 border-purple-500/20 text-purple-400 font-bold" 
                      : "glass border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Exclude Out of Stock</span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${inStockOnly ? "border-purple-500 bg-purple-600" : "border-white/20"}`}>
                    {inStockOnly && <CheckMark />}
                  </div>
                </Link>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <main className="col-span-1 lg:col-span-3">
            {products.length === 0 ? (
              <div className="glass rounded-3xl py-24 text-center">
                <Zap className="w-12 h-12 text-purple-500/20 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-400">No products match filters</h2>
                <p className="text-gray-600 text-sm mt-2">Try clearing your filters or resetting searches.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => {
                  const ratingAvg = product.reviews && product.reviews.length > 0 
                    ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
                    : null;
                  
                  return (
                    <Link key={product.id} href={`/products/${product.slug}`}>
                      <article className="glass rounded-2xl overflow-hidden hover-lift group h-full flex flex-col border border-white/5">
                        <div className="aspect-square bg-gradient-to-br from-purple-900/10 to-pink-900/10 relative overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Zap className="w-10 h-10 text-purple-400/20" />
                            </div>
                          )}
                          {product.comparePrice && product.comparePrice > product.price && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded-lg uppercase">
                              SALE
                            </div>
                          )}
                          {ratingAvg && (
                            <div className="absolute bottom-3 left-3 bg-black/75 border border-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{ratingAvg}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <p className="text-[10px] text-purple-400 uppercase tracking-widest font-black mb-1">{product.category}</p>
                          <h2 className="font-bold text-white text-sm mb-2 line-clamp-2 flex-grow">{product.name}</h2>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-black text-white">₹{product.price}</span>
                              {product.comparePrice && (
                                <span className="text-xs text-gray-500 line-through">₹{product.comparePrice}</span>
                              )}
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${product.inventory > 0 ? "text-green-500" : "text-red-500"}`}>
                              {product.inventory > 0 ? `${product.inventory} Stock` : "Sold Out"}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

// Small helper UI components
function CheckMark() {
  return (
    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
