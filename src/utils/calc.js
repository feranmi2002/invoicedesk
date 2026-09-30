// src/utils/calc.js
//
// All the money maths lives here as small PURE functions (no React,
// no side effects). That makes them easy to test with `npm test`.
//
// Why round at every step? Computers store decimals in binary, so
// 0.1 + 0.2 gives 0.30000000000000004. On an invoice that is a bug.
// We round to 2 decimal places after each calculation.

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Form inputs give us strings ("3", "", "abc"). Turn them into safe numbers.
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function lineTotal(item) {
  const qty = Math.max(0, toNumber(item.qty));
  const price = Math.max(0, toNumber(item.price));
  return round2(qty * price);
}

// Order of operations on an invoice:
//   subtotal = sum of lines
//   taxable  = subtotal - discount
//   tax      = taxable x rate
//   total    = taxable + tax
export function calcTotals(invoice) {
  const subtotal = round2(invoice.items.reduce((sum, item) => sum + lineTotal(item), 0));
  // A discount can never be bigger than the subtotal or below zero
  const discount = Math.min(Math.max(0, round2(toNumber(invoice.discount))), subtotal);
  const taxable = round2(subtotal - discount);
  const tax = round2((taxable * Math.max(0, toNumber(invoice.taxRate))) / 100);
  const total = round2(taxable + tax);
  return { subtotal, discount, taxable, tax, total };
}
