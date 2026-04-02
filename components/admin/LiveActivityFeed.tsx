"use client";

import { useEffect, useState } from "react";
import { Zap, ShoppingCart, User, AlertCircle, Clock } from "lucide-react";

interface Activity {
  id: string;
  eventType: string;
  userId: string | null;
  metadata: any;
  createdAt: string;
  page?: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/admin/activity");
      const data = await res.json();
      if (Array.isArray(data)) {
        setActivities(data);
      }
    } catch (e) {
      console.error("Activity fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "purchase": return <ShoppingCart className="w-4 h-4 text-green-400" />;
      case "add_to_cart": return <ShoppingCart className="w-4 h-4 text-blue-400" />;
      case "admin_action": return <Zap className="w-4 h-4 text-purple-400" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessage = (activity: Activity) => {
    const meta = activity.metadata || {};
    switch (activity.eventType) {
      case "purchase": return `New Purchase: ${activity.userId || "Guest"}`;
      case "add_to_cart": return "Item added to cart";
      case "checkout_start": return "Checkout started";
      case "admin_action": return `${meta.action?.replace("_", " ")}: ${meta.name || meta.campaignId || "System"}`;
      case "page_view": return `Visited ${activity.page || "Store"}`;
      default: return activity.eventType.replace("_", " ");
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-[400px] flex items-center justify-center">
        <Loader className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Live Activity Feed
        </h2>
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-green-500 animate-pulse font-black">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Live
        </span>
      </div>

      <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {activities.length > 0 ? (
          activities.map((a) => (
            <div key={a.id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                {getIcon(a.eventType)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold truncate text-gray-200">
                  {getMessage(a)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 italic">
                    {new Date(a.createdAt).toLocaleTimeString()}
                  </span>
                  {a.metadata?.mocked && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 rounded-full border border-purple-500/30">
                      Simulation
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <AlertCircle className="w-12 h-12 mb-2 text-gray-600" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-600 text-center">
        Updates automatically every 10 seconds
      </div>
    </div>
  );
}

function Loader({ className }: { className?: string }) {
  return <Zap className={className} />;
}
