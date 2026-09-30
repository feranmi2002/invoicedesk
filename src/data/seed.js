// src/data/seed.js
//
// Sample data so the app looks alive on first run. All names are made up.
// Dates are built relative to today so "overdue" always shows up.

import { addDays, todayString } from "../utils/dates.js";

export const seedProfile = {
  name: "Bright Studio Ltd",
  email: "hello@brightstudio.example",
  phone: "+234 800 000 0000",
  address: "12 Admiralty Way, Lekki, Lagos",
  paymentDetails:
    "Bank: Example Bank\nAccount name: Bright Studio Ltd\nAccount number: 0123456789",
  defaultCurrency: "NGN",
  defaultTaxRate: 7.5,
  defaultNotes: "Thank you for your business. Payment is due by the date shown above.",
};

function item(id, description, qty, price) {
  return { id, description, qty: String(qty), price: String(price) };
}

export function createSeedInvoices() {
  const today = todayString();
  const day = (n) => addDays(today, n);

  return [
    {
      id: "inv_seed1",
      number: "INV-0005",
      status: "unpaid",
      issueDate: day(-2),
      dueDate: day(12),
      currency: "USD",
      client: {
        name: "Northwind Studio",
        email: "accounts@northwind.example",
        address: "48 Harbour Street\nBristol, UK",
      },
      items: [
        item("a1", "Landing page design", 1, 800),
        item("a2", "SEO setup", 1, 350),
      ],
      taxRate: "0",
      discount: "0",
      notes: "Payment by bank transfer. Thank you.",
    },
    {
      id: "inv_seed2",
      number: "INV-0004",
      status: "unpaid",
      issueDate: day(-8),
      dueDate: day(6),
      currency: "NGN",
      client: {
        name: "Greenfield Academy",
        email: "bursar@greenfield.example",
        address: "5 School Road\nIkeja, Lagos",
      },
      items: [item("b1", "Flutter training session", 8, 35000)],
      taxRate: "7.5",
      discount: "0",
      notes: seedProfile.defaultNotes,
    },
    {
      id: "inv_seed3",
      number: "INV-0003",
      status: "paid",
      issueDate: day(-20),
      dueDate: day(-6),
      currency: "NGN",
      client: {
        name: "Tunde's Bakery",
        email: "tunde@bakery.example",
        address: "22 Market Lane\nYaba, Lagos",
      },
      items: [
        item("c1", "Logo and brand kit", 1, 120000),
        item("c2", "Printed menu design", 1, 30000),
      ],
      taxRate: "7.5",
      discount: "0",
      notes: seedProfile.defaultNotes,
    },
    {
      id: "inv_seed4",
      number: "INV-0002",
      status: "unpaid",
      issueDate: day(-28),
      dueDate: day(-14),
      currency: "NGN",
      client: {
        name: "Orbit Logistics",
        email: "finance@orbit.example",
        address: "Plot 9, Industrial Estate\nApapa, Lagos",
      },
      items: [item("d1", "Mobile app maintenance (monthly)", 3, 120000)],
      taxRate: "7.5",
      discount: "20000",
      notes: "Friendly reminder: this invoice is now overdue.",
    },
    {
      id: "inv_seed5",
      number: "INV-0001",
      status: "paid",
      issueDate: day(-45),
      dueDate: day(-31),
      currency: "NGN",
      client: {
        name: "Lekki Fresh Foods",
        email: "office@lekkifresh.example",
        address: "10 Coastal Road\nLekki, Lagos",
      },
      items: [
        item("e1", "Website redesign", 1, 450000),
        item("e2", "Hosting (12 months)", 1, 60000),
      ],
      taxRate: "7.5",
      discount: "0",
      notes: seedProfile.defaultNotes,
    },
  ];
}
