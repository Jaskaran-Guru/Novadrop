"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatNumber } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Target, Users, Zap } from "lucide-react";

interface Stats {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    recentOrders: number;
    recentRevenue: number;
    roas: number;
    cac: number;
    conversionRate: number;
    totalSpend: number;
  };
  funnel: { step: string; count: number }[];
  dailyChart: { date: string; orders: number; revenue: number }[];
}

const COLORS = ["#8b5cf6", "#6d28d9", "#4c1d95", "#2e1065"];

import { LiveActivityFeed } from "@/components/admin/LiveActivityFeed";

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalRevenue: 0, totalOrders: 0, recentOrders: 0, recentRevenue: 0,
    roas: 0, cac: 0, conversionRate: 0, totalSpend: 0,
  };

  const kpiCards = [
    { label: "Total Revenue", value: formatPrice(kpis.totalRevenue), icon: DollarSign, change: `+${formatPrice(kpis.recentRevenue)} this week` },
    { label: "Total Orders", value: kpis.totalOrders.toLocaleString(), icon: ShoppingBag, change: `+${kpis.recentOrders} this week` },
    { label: "ROAS", value: `${kpis.roas}x`, icon: TrendingUp, change: "Return on ad spend" },
    { label: "Conversion Rate", value: `${kpis.conversionRate}%`, icon: Target, change: "View → Purchase" },
    { label: "Ad Spend", value: formatPrice(kpis.totalSpend), icon: Zap, change: "Total campaign spend" },
    { label: "CAC", value: formatPrice(kpis.cac), icon: Users, change: "Cost to acquire customer" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-1">Dashboard Overview</h1>
          <p className="text-gray-500">Full-funnel D2C performance metrics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] uppercase tracking-tighter font-black text-green-500">System Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="glass rounded-2xl p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-black gradient-text mt-1">{value}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600">{change}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Revenue + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6">Revenue (Last 14 Days)</h2>
          {stats?.dailyChart && stats.dailyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.dailyChart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-600">
              No revenue data yet. Seed the database or place test orders.
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-1">
          <LiveActivityFeed />
        </div>
      </div>

      {/* Funnel + Orders Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6">Conversion Funnel</h2>
          {stats?.funnel && stats.funnel.some((f) => f.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#555" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="step" stroke="#555" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {stats.funnel.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-3">
              {["Page Views", "Add to Cart", "Checkout Start", "Purchase"].map((step, i) => (
                <div key={step} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{step}</span>
                  <div className="flex-1 mx-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${100 - i * 25}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-purple-400">
                    {[1240, 380, 142, 89][i]}
                  </span>
                </div>
              ))}
              <p className="text-xs text-gray-600 mt-2">Sample data — add real tracking events to see live data</p>
            </div>
          )}
        </div>

        {/* Daily Orders */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6">Daily Orders</h2>
          {stats?.dailyChart && stats.dailyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 11 }} />
                <YAxis stroke="#555" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px" }}
                />
                <Bar dataKey="orders" fill="#6d28d9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 text-sm">No orders yet</p>
                <p className="text-xs text-gray-700 mt-1">Place test orders to see data here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
