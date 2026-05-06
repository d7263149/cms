"use client";

import { useState, useEffect, useRef } from "react";
import { TickerData } from "@/lib/types";
import { SYMBOLS } from "@/lib/bybit";
import { fmtPrice, fmtVolume, fmtFunding, fmtCountdown, fmtChange } from "@/lib/utils";

const COIN_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  BTC: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500" },
  ETH: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-500" },
  XRP: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-500" },
};

function FlashCell({ value, children, className }: { value: number; children: React.ReactNode; className?: string }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setFlash(value > prev.current ? "up" : "down");
      prev.current = value;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={`transition-colors duration-300 ${flash === "up" ? "text-green-400" : flash === "down" ? "text-red-400" : ""} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

interface Props {
  initial: TickerData[];
}

export default function LiveTable({ initial }: Props) {
  const [tickers, setTickers] = useState<TickerData[]>(initial);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [status, setStatus] = useState<"live" | "error">("live");

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/tickers", { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setTickers(json.data);
          setLastUpdate(new Date());
          setStatus("live");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === "live" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs text-gray-500">
            {status === "live" ? "Live" : "Reconnecting"} · Updates every 1s
          </span>
        </div>
        <span className="text-xs text-gray-600">
          {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-800 shadow-2xl">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0d1117]">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase w-8">#</th>
              <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Contract</th>
              <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">
  Type
</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Last Price</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">24h Change</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">24h High</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">24h Low</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Bid / Ask</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Volume 24h</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Open Interest</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Index Price</th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Funding Rate</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">Next Funding</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-500 tracking-widest uppercase">
  Maker / Taker
</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map((t, i) => {
              const cfg = SYMBOLS.find((s) => s.base === t.base_currency);
              const col = COIN_COLORS[t.base_currency] ?? COIN_COLORS["BTC"];
              const isPos = t.price_change_24h >= 0;
              const fundingPos = t.funding_rate >= 0;

              return (
                <tr
                  key={t.ticker_id}
                  className="border-b border-gray-800/60 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* # */}
                  <td className="px-5 py-4 text-gray-600 text-xs">{i + 1}</td>

                  {/* Contract name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${col.bg} border ${col.border} flex items-center justify-center flex-shrink-0`}>
                        <span className={`${col.text} text-sm font-bold`}>{cfg?.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm tracking-tight">
                            {t.base_currency}/{t.quote_currency}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            PERP
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-mono">{t.ticker_id}</span>
                      </div>
                    </div>
                  </td>
                  {/* Product Type */}
<td className="px-4 py-4">
  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
    t.product_type === "Perpetual"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : t.product_type === "Futures"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
  }`}>
    {t.product_type}
  </span>
  {t.expiry_timestamp && (
    <div className="text-gray-600 text-xs mt-1">
      Exp: {new Date(t.expiry_timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
    </div>
  )}
</td>

                  {/* Last price */}
                  <td className="px-4 py-4 text-right">
                    <FlashCell value={t.last_price}>
                      <span className="font-bold text-white font-mono text-sm">
                        ${fmtPrice(t.last_price)}
                      </span>
                    </FlashCell>
                  </td>

                  {/* 24h change */}
                  <td className="px-4 py-4 text-right">
                    <span className={`font-semibold text-sm font-mono ${isPos ? "text-green-400" : "text-red-400"}`}>
                      {fmtChange(t.price_change_24h)}
                    </span>
                  </td>

                  {/* High */}
                  <td className="px-4 py-4 text-right">
                    <span className="text-green-400 font-mono text-xs">${fmtPrice(t.high)}</span>
                  </td>

                  {/* Low */}
                  <td className="px-4 py-4 text-right">
                    <span className="text-red-400 font-mono text-xs">${fmtPrice(t.low)}</span>
                  </td>

                  {/* Bid / Ask */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <FlashCell value={t.bid}>
                        <span className="text-green-400 font-mono text-xs">${fmtPrice(t.bid)}</span>
                      </FlashCell>
                      <FlashCell value={t.ask}>
                        <span className="text-red-400 font-mono text-xs">${fmtPrice(t.ask)}</span>
                      </FlashCell>
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-4 text-right">
                    <FlashCell value={t.USD_volume}>
                      <span className="text-white font-mono text-sm font-medium">{fmtVolume(t.USD_volume)}</span>
                    </FlashCell>
                    <div className="text-gray-600 text-xs font-mono mt-0.5">
                      {t.base_volume.toLocaleString("en-US", { maximumFractionDigits: 2 })} {t.base_currency}
                    </div>
                  </td>

                  {/* Open Interest */}
                  <td className="px-4 py-4 text-right">
                    <FlashCell value={t.open_interest_usd}>
                      <span className="text-white font-mono text-sm font-medium">{fmtVolume(t.open_interest_usd)}</span>
                    </FlashCell>
                    <div className="text-gray-600 text-xs font-mono mt-0.5">
                      {t.open_interest.toLocaleString("en-US", { maximumFractionDigits: 0 })} {t.base_currency}
                    </div>
                  </td>

                  {/* Index Price */}
                  <td className="px-4 py-4 text-right">
                    <FlashCell value={t.index_price}>
                      <span className="text-gray-300 font-mono text-xs">${fmtPrice(t.index_price)}</span>
                    </FlashCell>
                  </td>

                  {/* Funding Rate */}
                  <td className="px-4 py-4 text-right">
                    <span className={`font-mono text-sm font-semibold ${fundingPos ? "text-green-400" : "text-red-400"}`}>
                      {fmtFunding(t.funding_rate)}
                    </span>
                  </td>

                  {/* Next Funding */}
                  <td className="px-5 py-4 text-right">
                    <div className="text-gray-300 font-mono text-xs">{fmtFunding(t.next_funding_rate)}</div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      {fmtCountdown(t.next_funding_rate_timestamp)}
                    </div>
                  </td>

                  {/* Maker / Taker Fee */}
<td className="px-5 py-4 text-right">
  <div className="flex items-center justify-end gap-1 font-mono text-xs">
    <span className={t.maker_fee < 0 ? "text-green-400" : "text-gray-400"}>
      {t.maker_fee < 0 ? "-" : ""}{Math.abs(t.maker_fee * 100).toFixed(4)}%
    </span>
    <span className="text-gray-700">/</span>
    <span className="text-gray-400">
      {(t.taker_fee * 100).toFixed(4)}%
    </span>
  </div>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-700 text-right px-1">
        Source: Bybit · Perpetual contracts · Maker −0.01% / Taker +0.06%
      </p>
    </div>
  );
}
