import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  // Only allow in non-production or with a secret
  if (process.env.NODE_ENV === "production") {
    const { secret } = await req.json().catch(() => ({ secret: "" }));
    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
      where: { email: "admin@novadrop.com" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@novadrop.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    // Create products
    const products = [
      {
        name: "Premium Wireless Earbuds Pro",
        slug: "premium-wireless-earbuds-pro",
        description: "Experience crystal-clear audio with our flagship earbuds. Active noise cancellation, 30hr battery life, IPX5 water resistance. Validated by 2000+ customers with 4.9★ rating.",
        price: 2999,
        comparePrice: 4999,
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500"],
        category: "electronics",
        tags: ["audio", "wireless", "bestseller"],
        featured: true,
        active: true,
        inventory: 45,
      },
      {
        name: "Smart Fitness Tracker Band",
        slug: "smart-fitness-tracker-band",
        description: "Track your health metrics in real-time. Heart rate, SpO2, sleep tracking, and 15-day battery. Compatible with iOS & Android. Our highest converting product at 8.2% CTR.",
        price: 1799,
        comparePrice: 2999,
        images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500"],
        category: "fitness",
        tags: ["fitness", "health", "wearable"],
        featured: true,
        active: true,
        inventory: 67,
      },
      {
        name: "Mechanical Gaming Keyboard RGB",
        slug: "mechanical-gaming-keyboard-rgb",
        description: "Cherry MX switches, per-key RGB lighting, aluminium frame. Built for gamers and developers. 1000Hz polling rate for zero lag performance.",
        price: 4499,
        comparePrice: 6999,
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"],
        category: "tech",
        tags: ["gaming", "keyboard", "rgb"],
        featured: true,
        active: true,
        inventory: 23,
      },
      {
        name: "Minimalist Leather Wallet",
        slug: "minimalist-leather-wallet",
        description: "Slim RFID-blocking genuine leather wallet. Holds 8 cards + cash. Zero bulk. The wallet you'll use every day for years. Trending product — 340 units sold in week 1.",
        price: 799,
        comparePrice: 1299,
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=500"],
        category: "accessories",
        tags: ["wallet", "leather", "minimalist"],
        featured: true,
        active: true,
        inventory: 120,
      },
      {
        name: "USB-C 140W Fast Charger",
        slug: "usbc-140w-fast-charger",
        description: "GaN technology, charges MacBook Pro, iPhone, iPad simultaneously. Travel-ready, foldable design. 3 ports (2x USB-C + 1x USB-A).",
        price: 1299,
        comparePrice: 2199,
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"],
        category: "electronics",
        tags: ["charger", "fast-charge", "usbc"],
        featured: false,
        active: true,
        inventory: 88,
      },
      {
        name: "Portable Bluetooth Speaker",
        slug: "portable-bluetooth-speaker",
        description: "360° sound, IPX7 waterproof, 20hr playtime. Perfect for beach, hiking, or home. Pairs with 2 speakers for stereo mode.",
        price: 2499,
        comparePrice: 3999,
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"],
        category: "electronics",
        tags: ["speaker", "bluetooth", "outdoor"],
        featured: false,
        active: true,
        inventory: 34,
      },
      {
        name: "Ergonomic Office Chair",
        slug: "ergonomic-office-chair",
        description: "Lumbar support, adjustable armrests, breathable mesh back. Built for all-day comfort at your home office or workplace. Assembled in 20 minutes.",
        price: 19999,
        comparePrice: 29999,
        images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"],
        category: "furniture",
        tags: ["office", "ergonomic", "chair"],
        featured: false,
        active: true,
        inventory: 12,
      },
      {
        name: "Stainless Steel Water Bottle 1L",
        slug: "stainless-steel-water-bottle-1l",
        description: "Triple-wall vacuum insulation. Keeps drinks cold 24hr, hot 12hr. BPA-free, leak-proof lid. Dishwasher safe. 8 premium colors.",
        price: 699,
        comparePrice: 999,
        images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"],
        category: "lifestyle",
        tags: ["bottle", "hydration", "eco"],
        featured: false,
        active: true,
        inventory: 200,
      },
    ];

    for (const p of products) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: p,
        create: p,
      });
    }

    // Create sample ad campaigns
    const campaigns = [
      {
        name: "FB - Summer Collection Launch",
        platform: "facebook",
        status: "ended",
        budget: 5000,
        spend: 4800,
        impressions: 125000,
        clicks: 3250,
        conversions: 89,
        revenue: 38400,
        ctr: 2.6,
        cpc: 1.48,
        roas: 8.0,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-15"),
      },
      {
        name: "IG - Product Demo Creative A",
        platform: "instagram",
        status: "ended",
        budget: 3000,
        spend: 2950,
        impressions: 88000,
        clicks: 1980,
        conversions: 54,
        revenue: 22680,
        ctr: 2.25,
        cpc: 1.49,
        roas: 7.69,
        startDate: new Date("2024-05-15"),
        endDate: new Date("2024-05-30"),
      },
      {
        name: "FB - Retargeting Warm Audience",
        platform: "facebook",
        status: "ended",
        budget: 2000,
        spend: 1890,
        impressions: 45000,
        clicks: 2340,
        conversions: 72,
        revenue: 30240,
        ctr: 5.2,
        cpc: 0.81,
        roas: 16.0,
        startDate: new Date("2024-05-20"),
        endDate: new Date("2024-06-05"),
      },
      {
        name: "IG - Lookalike 2% Audience",
        platform: "instagram",
        status: "active",
        budget: 4000,
        spend: 1200,
        impressions: 32000,
        clicks: 960,
        conversions: 28,
        revenue: 11760,
        ctr: 3.0,
        cpc: 1.25,
        roas: 9.8,
        startDate: new Date("2024-07-01"),
        endDate: null,
      },
    ];

    for (const c of campaigns) {
      await prisma.adCampaign.create({ data: c }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded! Admin: admin@novadrop.com / admin123",
      counts: { products: products.length, campaigns: campaigns.length, admin: 1 },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
