const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database Seeding started...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("password123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@novadrop.com" },
    update: {
      password: adminPassword,
    },
    create: {
      id: "admin-1",
      email: "admin@novadrop.com",
      name: "Demo Admin",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // 2. Create Products
  const products = [
    {
      name: "Premium Wireless Earbuds Pro",
      slug: "premium-wireless-earbuds-pro",
      description: "Experience crystal-clear audio with our flagship earbuds. Active noise cancellation, 30hr battery life, IPX5 water resistance.",
      price: 2999,
      comparePrice: 4999,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
      category: "electronics",
      tags: ["audio", "wireless", "bestseller"],
      featured: true,
      active: true,
      inventory: 45,
    },
    {
      name: "Smart Fitness Tracker Band",
      slug: "smart-fitness-tracker-band",
      description: "Track your health metrics in real-time. Heart rate, SpO2, sleep tracking, and 15-day battery. Compatible with iOS & Android.",
      price: 1799,
      comparePrice: 2999,
      images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"],
      category: "fitness",
      tags: ["fitness", "health", "wearable"],
      featured: true,
      active: true,
      inventory: 67,
    },
    {
      name: "Mechanical Gaming Keyboard RGB",
      slug: "mechanical-gaming-keyboard-rgb",
      description: "Cherry MX switches, per-key RGB lighting, aluminium frame. Built for gamers and developers. 1000Hz polling rate.",
      price: 4499,
      comparePrice: 6999,
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"],
      category: "tech",
      tags: ["gaming", "keyboard", "rgb"],
      featured: true,
      active: true,
      inventory: 23,
    },
    {
      name: "Minimalist Leather Wallet",
      slug: "minimalist-leather-wallet",
      description: "Slim RFID-blocking genuine leather wallet. Holds 8 cards + cash. Zero bulk. The wallet you'll use every day for years.",
      price: 799,
      comparePrice: 1299,
      images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"],
      category: "accessories",
      tags: ["wallet", "leather", "minimalist"],
      featured: true,
      active: true,
      inventory: 120,
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log("✅ Products seeded.");

  // 3. Create Ad Campaigns
  const campaigns = [
    {
      name: "FB - Summer Collection Launch",
      platform: "facebook",
      status: "active",
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
    },
    {
      name: "IG - Product Demo Creative A",
      platform: "instagram",
      status: "active",
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
    }
  ];

  for (const campaign of campaigns) {
    await prisma.adCampaign.create({ data: campaign });
  }

  console.log("✅ Ad campaigns seeded.");
  console.log("✨ Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
