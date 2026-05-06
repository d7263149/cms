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

// Binance Futures API — works on Vercel (no geo-block)
const BINANCE_BASE = "https://fapi.binance.com";

export async function fetchBinanceTicker(symbol: string): Promise<any> {
  const url = `${BINANCE_BASE}/fapi/v1/ticker/24hr?symbol=${symbol}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Binance fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchBinancePremiumIndex(symbol: string): Promise<any> {
  const url = `${BINANCE_BASE}/fapi/v1/premiumIndex?symbol=${symbol}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export function mapBinanceToB2(ticker: any, premium: any, config: SymbolConfig): TickerData {
  const last = parseFloat(ticker.lastPrice ?? "0");
  const open24h = parseFloat(ticker.openPrice ?? "0");
  const priceChange = open24h > 0 ? ((last - open24h) / open24h) * 100 : 0;

  // Next funding time — Binance gives it in premiumIndex
  // Funding happens every 8 hours: 00:00, 08:00, 16:00 UTC
  const now = Date.now();
  const nextFunding = premium?.nextFundingTime
    ? parseInt(premium.nextFundingTime)
    : now + (8 * 3600 * 1000) - (now % (8 * 3600 * 1000));

  return {
    ticker_id: config.ticker_id,
    base_currency: config.base,
    quote_currency: config.quote,
    last_price: last,
    base_volume: parseFloat(ticker.volume ?? "0"),
    USD_volume: parseFloat(ticker.quoteVolume ?? "0"),
    quote_volume: parseFloat(ticker.quoteVolume ?? "0"),
    bid: parseFloat(ticker.bidPrice ?? "0"),
    ask: parseFloat(ticker.askPrice ?? "0"),
    high: parseFloat(ticker.highPrice ?? "0"),
    low: parseFloat(ticker.lowPrice ?? "0"),
    product_type: "Perpetual",
    open_interest: 0, // separate call needed — /fapi/v1/openInterest
    open_interest_usd: 0,
    index_price: parseFloat(premium?.indexPrice ?? ticker.lastPrice ?? "0"),
    creation_timestamp: undefined,
    expiry_timestamp: undefined,
    funding_rate: parseFloat(premium?.lastFundingRate ?? "0"),
    next_funding_rate: parseFloat(premium?.lastFundingRate ?? "0"),
    next_funding_rate_timestamp: nextFunding,
    maker_fee: -0.0001,
    taker_fee: 0.0006,
    price_change_24h: priceChange,
  };
}

export async function fetchAllTickers(): Promise<TickerData[]> {
  const results = await Promise.allSettled(
    SYMBOLS.map(async (config) => {
      const [ticker, premium] = await Promise.all([
        fetchBinanceTicker(config.symbol),
        fetchBinancePremiumIndex(config.symbol),
      ]);
      return mapBinanceToB2(ticker, premium, config);
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<TickerData> => r.status === "fulfilled")
    .map((r) => r.value);
}