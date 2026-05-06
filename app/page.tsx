import { fetchAllTickers } from "@/lib/bybit";
import { TickerData } from "@/lib/types";
import LiveTable from "@/components/LiveTable";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initial: TickerData[] = [];
  try {
    initial = await fetchAllTickers();
  } catch {
    // fallback to empty — client will poll
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] text-white">
      <nav className="border-b border-gray-800/80 bg-[#0a0d12]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Activity size={14} className="text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">DerivData</span>
            </div>
            <div className="h-4 w-px bg-gray-800" />
            <nav className="flex items-center gap-5 text-sm">
              <a href="#" className="text-white font-medium">Derivatives</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Spot</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Options</a>
            </nav>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 border border-gray-800 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Bybit Live Feed
          </div>
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto px-5 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Derivatives Markets</h1>
          <p className="text-gray-500 text-sm mt-1">Perpetual contracts · Real-time data · Updates every second</p>
        </div>
        <LiveTable initial={initial} />
      </div>
    </div>
  );
}
