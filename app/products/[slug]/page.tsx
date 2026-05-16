import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import type { Metadata } from "next";

import { FALLBACK_PRODUCTS } from "@/lib/seed-data";

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, active: true },
      include: { variants: true },
    });
    
    if (product) return product;
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  } catch {
    
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — NovaDrop`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductDetail product={product} />
      </div>
    </div>
  );
}
