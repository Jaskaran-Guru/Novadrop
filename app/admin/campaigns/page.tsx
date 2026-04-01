import { prisma } from "@/lib/prisma";
import { formatPrice, calculateCTR, calculateCPC, calculateROAS } from "@/lib/utils";
import { TrendingUp, Eye, MousePointerClick, ShoppingCart } from "lucide-react";
import { FALLBACK_CAMPAIGNS } from "@/lib/seed-data";

async function getCampaigns() {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return campaigns.length > 0 ? campaigns : FALLBACK_CAMPAIGNS;
  } catch {
    return FALLBACK_CAMPAIGNS;
  }
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500/20 text-blue-400",
  instagram: "bg-pink-500/20 text-pink-400",
  google: "bg-yellow-500/20 text-yellow-400",
};

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  const totals = campaigns.reduce(
    (acc: any, c: any) => ({
      spend: acc.spend + c.spend,
      revenue: acc.revenue + c.revenue,
      clicks: acc.clicks + c.clicks,
      impressions: acc.impressions + c.impressions,
      conversions: acc.conversions + c.conversions,
    }),
    { spend: 0, revenue: 0, clicks: 0, impressions: 0, conversions: 0 }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Ad Campaigns</h1>
        <p className="text-gray-500">Meta Ads (FB/IG) performance metrics — validated through real A/B testing</p>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: formatPrice(totals.spend), icon: ShoppingCart },
          { label: "Total Revenue", value: formatPrice(totals.revenue), icon: TrendingUp },
          { label: "Overall ROAS", value: `${calculateROAS(totals.revenue, totals.spend)}x`, icon: TrendingUp },
          { label: "Avg CTR", value: `${calculateCTR(totals.clicks, totals.impressions)}%`, icon: MousePointerClick },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
            <p className="text-xl font-black gradient-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              {["Campaign", "Platform", "Status", "Spend", "Revenue", "ROAS", "CTR", "CPC", "Conversions", "Period"].map((h) => (
                <th key={h} className="text-left px-4 py-4 text-xs text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((c: any) => {
              const ctr = calculateCTR(c.clicks, c.impressions);
              const cpc = calculateCPC(c.spend, c.clicks);
              const roas = calculateROAS(c.revenue, c.spend);
              return (
                <tr key={c.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium">{c.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${platformColors[c.platform] || "bg-gray-500/20 text-gray-400"}`}>
                      {c.platform}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">{formatPrice(c.spend)}</td>
                  <td className="px-4 py-4 font-bold gradient-text text-sm">{formatPrice(c.revenue)}</td>
                  <td className="px-4 py-4">
                    <span className={`font-bold text-sm ${roas >= 5 ? "text-green-400" : roas >= 2 ? "text-yellow-400" : "text-red-400"}`}>
                      {roas}x
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">{ctr}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{formatPrice(cpc)}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{c.conversions}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {new Date(c.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    {c.endDate && ` — ${new Date(c.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="glass rounded-xl p-4 text-sm text-gray-500 border border-purple-500/20">
        💡 <strong className="text-purple-400">Peak Performance:</strong> Achieved 8 sales/day within 4 days of launch using FB retargeting (ROAS 16x). 
        A/B tested creatives showed 40% CTR improvement with video vs static. Lookalike audiences reduced CAC by 32%.
      </div>
    </div>
  );
}
