// Run with: npm test
// Uses Node's built-in test runner, so there is nothing extra to install.
// These work because the money logic is pure JavaScript with no React in it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcTotals, lineTotal, round2 } from "../src/utils/calc.js";
import {
  computeStats,
  getStatus,
  nextInvoiceNumber,
  validateInvoice,
} from "../src/utils/invoice.js";

const base = {
  id: "x",
  number: "INV-0001",
  status: "unpaid",
  issueDate: "2026-10-01",
  dueDate: "2026-10-15",
  currency: "NGN",
  client: { name: "Acme", email: "", address: "" },
  items: [{ id: "1", description: "Work", qty: "2", price: "1000" }],
  taxRate: "7.5",
  discount: "0",
  notes: "",
};

test("round2 fixes floating point noise", () => {
  assert.equal(round2(0.1 + 0.2), 0.3);
});

test("lineTotal multiplies qty by price and ignores bad input", () => {
  assert.equal(lineTotal({ qty: "3", price: "250.50" }), 751.5);
  assert.equal(lineTotal({ qty: "", price: "100" }), 0);
  assert.equal(lineTotal({ qty: "-2", price: "100" }), 0);
  assert.equal(lineTotal({ qty: "abc", price: "100" }), 0);
});

test("calcTotals applies discount before tax", () => {
  const t = calcTotals({ ...base, discount: "500" });
  assert.equal(t.subtotal, 2000);
  assert.equal(t.taxable, 1500);
  assert.equal(t.tax, 112.5);
  assert.equal(t.total, 1612.5);
});

test("a discount can never exceed the subtotal", () => {
  const t = calcTotals({ ...base, discount: "999999" });
  assert.equal(t.discount, 2000);
  assert.equal(t.total, 0);
});

test("getStatus derives overdue from the due date", () => {
  assert.equal(getStatus(base, "2026-10-10"), "unpaid");
  assert.equal(getStatus(base, "2026-10-15"), "unpaid"); // due today is not overdue
  assert.equal(getStatus(base, "2026-10-16"), "overdue");
  assert.equal(getStatus({ ...base, status: "paid" }, "2027-01-01"), "paid");
});

test("nextInvoiceNumber uses the highest number, not the count", () => {
  assert.equal(nextInvoiceNumber([]), "INV-0001");
  assert.equal(nextInvoiceNumber([{ number: "INV-0001" }, { number: "INV-0009" }]), "INV-0010");
});

test("validateInvoice catches the common mistakes", () => {
  assert.deepEqual(validateInvoice(base), {});
  assert.ok(validateInvoice({ ...base, client: { ...base.client, name: " " } }).client);
  assert.ok(validateInvoice({ ...base, dueDate: "2026-09-01" }).dates);
  assert.ok(validateInvoice({ ...base, items: [] }).items);
  assert.ok(
    validateInvoice({ ...base, items: [{ id: "1", description: "X", qty: "0", price: "5" }] }).items
  );
});

test("computeStats never mixes currencies", () => {
  const invoices = [
    { ...base, currency: "NGN", items: [{ id: "1", description: "A", qty: "1", price: "1000" }], taxRate: "0" },
    { ...base, currency: "USD", items: [{ id: "2", description: "B", qty: "1", price: "50" }], taxRate: "0", status: "paid" },
    { ...base, currency: "NGN", dueDate: "2026-10-02", items: [{ id: "3", description: "C", qty: "1", price: "200" }], taxRate: "0" },
  ];
  const s = computeStats(invoices, "2026-10-10");
  assert.deepEqual(s.outstanding, { NGN: 1200 });
  assert.deepEqual(s.overdue, { NGN: 200 });
  assert.deepEqual(s.paid, { USD: 50 });
});
