export interface TickerData {
  ticker_id: string;
  base_currency: string;
  quote_currency: string;
  last_price: number;
  base_volume: number;
  USD_volume: number;
  quote_volume: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  product_type: "Perpetual" | "Futures" | "Options";
  open_interest: number;
  open_interest_usd: number;
  index_price: number;
  creation_timestamp?: number;      // ← ADD: Futures/Options only
  expiry_timestamp?: number;        // ← ADD: Futures/Options only
  funding_rate: number;
  next_funding_rate: number;
  next_funding_rate_timestamp: number;
  maker_fee: number;
  taker_fee: number;
  price_change_24h: number;
}

export interface SymbolConfig {
  symbol: string;
  base: string;
  quote: string;
  ticker_id: string;
  icon: string;
  color: string;
}