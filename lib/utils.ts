export function fmt(value: number, decimals = 2): string {
  if (!value || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function fmtPrice(value: number): string {
  if (!value || isNaN(value)) return "—";
  if (value >= 1000) return fmt(value, 2);
  if (value >= 1) return fmt(value, 4);
  return fmt(value, 6);
}

export function fmtVolume(value: number): string {
  if (!value || isNaN(value)) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function fmtFunding(rate: number): string {
  if (isNaN(rate)) return "—";
  return `${(rate * 100).toFixed(4)}%`;
}

export function fmtCountdown(ts: number): string {
  const diff = ts - Date.now();
  if (diff <= 0) return "Soon";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function fmtChange(pct: number): string {
  if (isNaN(pct)) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}
