import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Zap, Filter } from "lucide-react";
import { FALLBACK_PRODUCTS } from "@/lib/seed-data";

async function getProducts(category?: string, search?: string) {
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
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return products.length > 0 ? products : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
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
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(params.category, params.search),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2">
            {params.category === "featured" ? " Featured Picks" : "All Products"}
          </h1>
          <p className="text-gray-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
            {params.category && params.category !== "all" ? ` in ${params.category}` : ""}
          </p>
        </div>

        
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          {["all", "featured", ...categories].map((cat) => (
            <Link
              key={cat}
              href={cat === "all" ? "/products" : `/products?category=${cat}`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (params.category || "all") === cat
                  ? "bg-purple-600 text-white"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Link>
          ))}
        </div>

        
        {products.length === 0 ? (
          <div className="text-center py-24">
            <Zap className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400">No products yet</h2>
            <p className="text-gray-600 mt-2">Check back soon or seed the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <article className="glass rounded-2xl overflow-hidden hover-lift group h-full flex flex-col">
                  <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-10 h-10 text-purple-400/20" />
                      </div>
                    )}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        SALE
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">{product.category}</p>
                    <h2 className="font-semibold text-white mb-2 line-clamp-2 flex-grow">{product.name}</h2>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold gradient-text">{formatPrice(product.price)}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${product.inventory > 0 ? "text-green-400" : "text-red-400"}`}>
                        {product.inventory > 0 ? `${product.inventory} left` : "Out"}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
