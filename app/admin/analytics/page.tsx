"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FALLBACK_STATS } from "@/lib/seed-data";
import { TrendingUp, Users, MousePointerClick, ShoppingCart, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [data, setData] = useState(FALLBACK_STATS.funnel);
  
  // Client-side hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-1">Funnel Analytics</h1>
        <p className="text-gray-500">Track drop-off rates across your entire D2C funnel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6 glow">
          <Users className="w-8 h-8 text-blue-400 mb-4" />
          <p className="text-sm text-gray-400 font-medium">Page Views</p>
          <p className="text-3xl font-bold mt-1 text-white">{data[0].count.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-6 glow">
          <MousePointerClick className="w-8 h-8 text-purple-400 mb-4" />
          <p className="text-sm text-gray-400 font-medium">Add to Cart</p>
          <p className="text-3xl font-bold mt-1 text-white">{data[1].count.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-2">↑ {((data[1].count / data[0].count) * 100).toFixed(1)}% Conv</p>
        </div>
        <div className="glass rounded-2xl p-6 glow">
          <ShoppingCart className="w-8 h-8 text-pink-400 mb-4" />
          <p className="text-sm text-gray-400 font-medium">Checkout Start</p>
          <p className="text-3xl font-bold mt-1 text-white">{data[2].count.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-2">↑ {((data[2].count / data[1].count) * 100).toFixed(1)}% Conv</p>
        </div>
        <div className="glass rounded-2xl p-6 glow">
          <CreditCard className="w-8 h-8 text-green-400 mb-4" />
          <p className="text-sm text-gray-400 font-medium">Purchases</p>
          <p className="text-3xl font-bold mt-1 text-white">{data[3].count.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-2">↑ {((data[3].count / data[2].count) * 100).toFixed(1)}% Conv</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 mt-8">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="text-purple-400 w-5 h-5" />
          <h2 className="text-xl font-bold">Conversion Funnel Drop-off</h2>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="step" stroke="#888" tick={{ fill: "#888" }} tickMargin={10} />
              <YAxis stroke="#888" tick={{ fill: "#888" }} />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "8px" }}
              />
              <Bar dataKey="count" fill="url(#colorUv)" radius={[4, 4, 0, 0]} barSize={60} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
