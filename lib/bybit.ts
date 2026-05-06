import { TickerData, SymbolConfig } from "./types";

export const SYMBOLS: SymbolConfig[] = [
  {
    symbol: "BTCUSDT",
    base: "BTC",
    quote: "USDT",
    ticker_id: "BTC-PERPUSDT",
    icon: "₿",
    color: "amber",
  },
  {
    symbol: "ETHUSDT",
    base: "ETH",
    quote: "USDT",
    ticker_id: "ETH-PERPUSDT",
    icon: "Ξ",
    color: "blue",
  },
  {
    symbol: "XRPUSDT",
    base: "XRP",
    quote: "USDT",
    ticker_id: "XRP-PERPUSDT",
    icon: "✕",
    color: "cyan",
  },
];

const BYBIT_BASE = "https://api.bybit.com";

export async function fetchBybitTicker(symbol: string): Promise<any> {
  const url = `${BYBIT_BASE}/v5/market/tickers?category=linear&symbol=${symbol}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Bybit fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.retCode !== 0) throw new Error(`Bybit error: ${json.retMsg}`);
  return json.result.list[0];
}

export async function fetchBybitFundingRate(symbol: string): Promise<any> {
  const url = `${BYBIT_BASE}/v5/market/funding/history?category=linear&symbol=${symbol}&limit=1`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result?.list?.[0] ?? null;
}

export function mapBybitToB2(raw: any, config: SymbolConfig): TickerData {
  const last = parseFloat(raw.lastPrice ?? "0");
  const open24h = parseFloat(raw.prevPrice24h ?? raw.openPrice ?? "0");
  const priceChange = open24h > 0 ? ((last - open24h) / open24h) * 100 : 0;

  // Perpetual swaps — no creation or expiry timestamp
  // For futures/options, these would come from a separate instrument API
  const creation_timestamp = undefined;
  const expiry_timestamp = undefined;

  return {
    ticker_id: config.ticker_id,
    base_currency: config.base,
    quote_currency: config.quote,
    last_price: last,
    base_volume: parseFloat(raw.volume24h ?? "0"),
    USD_volume: parseFloat(raw.turnover24h ?? "0"),
    quote_volume: parseFloat(raw.turnover24h ?? "0"),
    bid: parseFloat(raw.bid1Price ?? "0"),
    ask: parseFloat(raw.ask1Price ?? "0"),
    high: parseFloat(raw.highPrice24h ?? "0"),
    low: parseFloat(raw.lowPrice24h ?? "0"),
    product_type: "Perpetual",
    open_interest: parseFloat(raw.openInterest ?? "0"),
    open_interest_usd: parseFloat(raw.openInterestValue ?? "0"),
    index_price: parseFloat(raw.indexPrice ?? "0"),
    creation_timestamp,   // undefined for perpetuals (B2 spec: not needed)
    expiry_timestamp,     // undefined for perpetuals (B2 spec: not needed)
    funding_rate: parseFloat(raw.fundingRate ?? "0"),
    next_funding_rate: parseFloat(raw.fundingRate ?? "0"),
    next_funding_rate_timestamp: parseInt(raw.nextFundingTime ?? "0"),
    maker_fee: -0.0001,
    taker_fee: 0.0006,
    price_change_24h: priceChange,
  };
}

export async function fetchAllTickers(): Promise<TickerData[]> {
  const results = await Promise.allSettled(
    SYMBOLS.map(async (config) => {
      const raw = await fetchBybitTicker(config.symbol);
      return mapBybitToB2(raw, config);
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<TickerData> => r.status === "fulfilled")
    .map((r) => r.value);
}