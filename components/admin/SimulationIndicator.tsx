"use client";

import { useEffect, useState } from "react";
import { Zap, Database, AlertCircle } from "lucide-react";

export function SimulationIndicator() {
  const [isSimulation, setIsSimulation] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // We check if any of the recent API calls reported a 'mocked' flag
    // In a real app, this could be via a global state or a dedicated meta-endpoint
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        // The API returns 'mocked: true' if it's using FALLBACK_STATS
        setIsSimulation(!!data.mocked);
        setLastCheck(new Date());
      } catch {
        setIsSimulation(true);
        setLastCheck(new Date());
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 pointer-events-none">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl glass border ${
        isSimulation ? 'border-orange-500/50 bg-orange-500/10' : 'border-emerald-500/50 bg-emerald-500/10'
      } shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500`}>
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${isSimulation ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
          {isSimulation && (
            <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20" />
          )}
        </div>
        
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isSimulation ? 'text-orange-400' : 'text-emerald-400'}`}>
            System Status
          </span>
          <span className="text-xs font-medium text-white flex items-center gap-1.5">
            {isSimulation ? (
              <>
                <AlertCircle className="w-3 h-3 text-orange-400" />
                Simulation Mode
              </>
            ) : (
              <>
                <Database className="w-3 h-3 text-emerald-400" />
                Live Database
              </>
            )}
          </span>
        </div>
      </div>
      
      {lastCheck && (
        <span className="text-[10px] text-gray-500/50 translate-x-[-8px]">
          Last sync: {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
