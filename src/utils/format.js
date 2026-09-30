// src/utils/format.js

export const CURRENCIES = [
  { code: "NGN", label: "Naira (NGN)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "GBP", label: "Pound (GBP)" },
  { code: "EUR", label: "Euro (EUR)" },
];

// Intl.NumberFormat is built into the browser. It handles the symbol,
// thousands separators and decimals for us, so we never do it by hand.
export function formatMoney(amount, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount || 0);
}

// Totals are kept per currency, like { NGN: 500000, USD: 1150 }.
// You must never add naira to dollars, so we show each one separately.
export function formatTotals(byCurrency) {
  const entries = Object.entries(byCurrency);
  if (entries.length === 0) return formatMoney(0, "NGN");
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(" + ");
}
