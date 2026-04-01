export const FALLBACK_PRODUCTS = [
  {
    id: "p1",
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
    variants: []
  },
  {
    id: "p2",
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
    variants: []
  },
  {
    id: "p3",
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
    variants: []
  },
  {
    id: "p4",
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
    variants: []
  }
];

export const FALLBACK_CAMPAIGNS = [
  {
    id: "c1", name: "FB - Summer Collection Launch", platform: "facebook", status: "ended",
    budget: 5000, spend: 4800, impressions: 125000, clicks: 3250, conversions: 89,
    revenue: 38400, ctr: 2.6, cpc: 1.48, roas: 8.0, startDate: new Date("2024-06-01"), endDate: new Date("2024-06-15")
  },
  {
    id: "c2", name: "IG - Product Demo Creative A", platform: "instagram", status: "ended",
    budget: 3000, spend: 2950, impressions: 88000, clicks: 1980, conversions: 54,
    revenue: 22680, ctr: 2.25, cpc: 1.49, roas: 7.69, startDate: new Date("2024-05-15"), endDate: new Date("2024-05-30")
  },
  {
    id: "c3", name: "FB - Retargeting Warm Audience", platform: "facebook", status: "ended",
    budget: 2000, spend: 1890, impressions: 45000, clicks: 2340, conversions: 72,
    revenue: 30240, ctr: 5.2, cpc: 0.81, roas: 16.0, startDate: new Date("2024-05-20"), endDate: new Date("2024-06-05")
  }
];

export const FALLBACK_STATS = {
  kpis: {
    totalRevenue: 91320,
    totalOrders: 215,
    recentOrders: 12,
    recentRevenue: 4800,
    roas: 9.6,
    cac: 44.6,
    conversionRate: 2.8,
    totalSpend: 9640
  },
  funnel: [
    { step: "Page Views", count: 1240 },
    { step: "Add to Cart", count: 380 },
    { step: "Checkout Start", count: 142 },
    { step: "Purchase", count: 89 }
  ],
  dailyChart: [
    { date: "May 1", orders: 5, revenue: 1200 },
    { date: "May 5", orders: 12, revenue: 3500 },
    { date: "May 10", orders: 28, revenue: 7800 },
    { date: "May 15", orders: 40, revenue: 11200 },
    { date: "May 20", orders: 65, revenue: 18500 },
    { date: "May 25", orders: 89, revenue: 24600 },
    { date: "May 30", orders: 112, revenue: 31200 }
  ]
};
