// src/components/ProfileModal.jsx
//
// "Your business" details. They print at the top of every invoice and
// provide the defaults (currency, tax, notes) for new invoices.

import { useEffect, useState } from "react";
import { Field, inputClass } from "./ui";
import { CURRENCIES } from "../utils/format";

export default function ProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState(profile);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // Close on Escape. The returned cleanup removes the listener again.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, defaultTaxRate: Number(form.defaultTaxRate) || 0 });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label="Business details"
        className="my-8 w-full max-w-lg space-y-4 rounded-2xl border border-line bg-panel p-5 shadow-2xl"
      >
        <div>
          <h2 className="text-lg font-semibold">Your business</h2>
          <p className="text-xs text-slate-500">Shown on every invoice you create.</p>
        </div>

        <Field label="Business name" htmlFor="p-name">
          <input
            id="p-name"
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" htmlFor="p-email">
            <input
              id="p-email"
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="p-phone">
            <input
              id="p-phone"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Address" htmlFor="p-address">
          <textarea
            id="p-address"
            rows={2}
            className={inputClass}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>

        <Field label="Payment details (bank transfer, etc.)" htmlFor="p-pay">
          <textarea
            id="p-pay"
            rows={3}
            className={inputClass}
            value={form.paymentDetails}
            onChange={(e) => set("paymentDetails", e.target.value)}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Default currency" htmlFor="p-cur">
            <select
              id="p-cur"
              className={inputClass}
              value={form.defaultCurrency}
              onChange={(e) => set("defaultCurrency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Default tax rate (%)" htmlFor="p-tax">
            <input
              id="p-tax"
              type="number"
              min="0"
              step="0.1"
              className={inputClass}
              value={form.defaultTaxRate}
              onChange={(e) => set("defaultTaxRate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Default invoice note" htmlFor="p-notes">
          <textarea
            id="p-notes"
            rows={2}
            className={inputClass}
            value={form.defaultNotes}
            onChange={(e) => set("defaultNotes", e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-panel-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            Save details
          </button>
        </div>
      </form>
    </div>
  );
}
