import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_STATS } from "@/lib/seed-data";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      recentOrders,
      recentRevenue,
      funnelEvents,
      campaignStats,
      ordersByDay,
    ] = await Promise.all([
      prisma.order.count({ where: { status: { in: ["PAID", "DELIVERED", "SHIPPED"] } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAID", "DELIVERED", "SHIPPED"] } },
      }),
      prisma.order.count({
        where: {
          status: { in: ["PAID", "DELIVERED", "SHIPPED"] },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ["PAID", "DELIVERED", "SHIPPED"] },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.adCampaign.aggregate({
        _sum: { spend: true, revenue: true, clicks: true, impressions: true },
      }),
      prisma.order.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        _sum: { total: true },
        where: {
          status: { in: ["PAID", "DELIVERED", "SHIPPED"] },
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const totalRevenueVal = totalRevenue._sum.total || 0;
    const totalSpend = campaignStats._sum.spend || 0;
    const totalCampaignRevenue = campaignStats._sum.revenue || 0;
    const roas = totalSpend > 0 ? totalCampaignRevenue / totalSpend : 0;
    const cac = totalOrders > 0 && totalSpend > 0 ? totalSpend / totalOrders : 0;

    const funnelMap: Record<string, number> = {};
    funnelEvents.forEach((e: any) => { funnelMap[e.eventType] = e._count.id; });

    const conversionRate = funnelMap["page_view"]
      ? ((funnelMap["purchase"] || 0) / funnelMap["page_view"]) * 100
      : 0;

    const dailyData: Record<string, { date: string; orders: number; revenue: number }> = {};
    ordersByDay.forEach((row: any) => {
      const date = new Date(row.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (!dailyData[date]) dailyData[date] = { date, orders: 0, revenue: 0 };
      dailyData[date].orders += row._count.id;
      dailyData[date].revenue += row._sum.total || 0;
    });

    
    if (totalOrders === 0 && totalRevenueVal === 0) {
      return NextResponse.json({ ...FALLBACK_STATS, mocked: true });
    }

    return NextResponse.json({
      kpis: {
        totalRevenue: totalRevenueVal,
        totalOrders,
        recentOrders,
        recentRevenue: recentRevenue._sum.total || 0,
        roas: parseFloat(roas.toFixed(2)),
        cac: parseFloat(cac.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        totalSpend,
      },
      funnel: [
        { step: "Page Views", count: funnelMap["page_view"] || 0 },
        { step: "Add to Cart", count: funnelMap["add_to_cart"] || 0 },
        { step: "Checkout Start", count: funnelMap["checkout_start"] || 0 },
        { step: "Purchase", count: funnelMap["purchase"] || 0 },
      ],
      dailyChart: Object.values(dailyData).slice(-14),
      mocked: false
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    
    return NextResponse.json({ ...FALLBACK_STATS, mocked: true });
  }
}
