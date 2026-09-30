// src/utils/invoice.js
//
// Business rules for invoices, kept out of the components.
// Note the explicit ".js" on imports: it lets `node --test` run this file.

import { calcTotals } from "./calc.js";
import { addDays, todayString } from "./dates.js";

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function blankItem() {
  return { id: makeId("item"), description: "", qty: "1", price: "" };
}

// INV-0007 comes after INV-0006. We read the highest number in use
// instead of counting invoices, so deleting one never reuses a number.
export function nextInvoiceNumber(invoices) {
  const highest = invoices.reduce((max, inv) => {
    const match = /(\d+)$/.exec(inv.number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `INV-${String(highest + 1).padStart(4, "0")}`;
}

export function newInvoice(invoices, profile) {
  const today = todayString();
  return {
    id: makeId("inv"),
    number: nextInvoiceNumber(invoices),
    status: "unpaid", // the only two STORED statuses: "unpaid" or "paid"
    issueDate: today,
    dueDate: addDays(today, 14),
    currency: profile.defaultCurrency,
    client: { name: "", email: "", address: "" },
    items: [blankItem()],
    taxRate: String(profile.defaultTaxRate),
    discount: "0",
    notes: profile.defaultNotes,
  };
}

export function duplicateInvoice(invoice, invoices) {
  const today = todayString();
  return {
    ...invoice,
    id: makeId("inv"),
    number: nextInvoiceNumber(invoices),
    status: "unpaid",
    issueDate: today,
    dueDate: addDays(today, 14),
    items: invoice.items.map((item) => ({ ...item, id: makeId("item") })),
  };
}

// DERIVED state. "overdue" is never stored. It is worked out from the due
// date every time, so it can never get out of date. A stored "overdue"
// flag would be wrong the moment midnight passes.
export function getStatus(invoice, today = todayString()) {
  if (invoice.status === "paid") return "paid";
  return invoice.dueDate < today ? "overdue" : "unpaid";
}

// Returns an object of error messages. An empty object means valid.
export function validateInvoice(invoice) {
  const errors = {};

  if (!invoice.number.trim()) errors.number = "Invoice number is required.";
  if (!invoice.client.name.trim()) errors.client = "Client name is required.";

  if (!invoice.issueDate || !invoice.dueDate) {
    errors.dates = "Both dates are required.";
  } else if (invoice.dueDate < invoice.issueDate) {
    errors.dates = "The due date cannot be before the issue date.";
  }

  const filled = invoice.items.filter((item) => item.description.trim());
  const brokenRow = filled.find(
    (item) => !(Number(item.qty) > 0) || item.price === "" || !(Number(item.price) >= 0)
  );
  if (filled.length === 0) {
    errors.items = "Add at least one item with a description.";
  } else if (brokenRow) {
    errors.items = `"${brokenRow.description}" needs a quantity above 0 and a price.`;
  }

  return errors;
}

// Drop empty rows before saving so the invoice stays tidy
export function cleanInvoice(invoice) {
  return { ...invoice, items: invoice.items.filter((item) => item.description.trim()) };
}

function addTo(map, currency, amount) {
  map[currency] = Math.round(((map[currency] || 0) + amount) * 100) / 100;
}

// Dashboard numbers, grouped by currency
export function computeStats(invoices, today = todayString()) {
  const stats = { outstanding: {}, overdue: {}, paid: {} };
  for (const invoice of invoices) {
    const { total } = calcTotals(invoice);
    const status = getStatus(invoice, today);
    if (status === "paid") {
      addTo(stats.paid, invoice.currency, total);
    } else {
      addTo(stats.outstanding, invoice.currency, total);
      if (status === "overdue") addTo(stats.overdue, invoice.currency, total);
    }
  }
  return stats;
}
