// src/components/InvoiceEditor.jsx
//
// Left side: the form. Right side: the live paper preview.
//
// KEY IDEA: the form edits a DRAFT copy held in local state. Nothing is
// written to the saved list until the user presses Save. That is how
// nearly every real-world edit form works.

import { useEffect, useState } from "react";
import InvoicePreview from "./InvoicePreview";
import { Field, inputClass } from "./ui";
import { calcTotals, lineTotal } from "../utils/calc";
import { blankItem, cleanInvoice, validateInvoice } from "../utils/invoice";
import { CURRENCIES, formatMoney } from "../utils/format";

export default function InvoiceEditor({ invoice, isSaved, clients, profile, onSave, onBack }) {
  const [draft, setDraft] = useState(invoice);
  const [baseline, setBaseline] = useState(invoice); // last saved version
  const [errors, setErrors] = useState({});
  const [justSaved, setJustSaved] = useState(false);

  // Unsaved changes? Compare the draft with the last saved version.
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  // Once error messages are showing, re-check after every edit so they
  // disappear as soon as the problem is fixed (not only on the next Save).
  useEffect(() => {
    if (Object.keys(errors).length > 0) setErrors(validateInvoice(draft));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // Show "Saved" for 2 seconds. The cleanup cancels the timer if the
  // component unmounts first, or if the user saves again quickly.
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  // ---- tiny immutable update helpers -------------------------------
  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setClient = (field, value) =>
    setDraft((d) => ({ ...d, client: { ...d.client, [field]: value } }));

  function changeClientName(name) {
    // If this matches a client from an earlier invoice, fill in their
    // email and address, but only into fields that are still empty.
    const known = clients.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    setDraft((d) => ({
      ...d,
      client: {
        name,
        email: d.client.email || known?.email || "",
        address: d.client.address || known?.address || "",
      },
    }));
  }

  const updateItem = (id, field, value) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  const addItem = () => setDraft((d) => ({ ...d, items: [...d.items, blankItem()] }));
  const removeItem = (id) =>
    setDraft((d) => ({
      ...d,
      // always keep at least one row on screen
      items: d.items.length > 1 ? d.items.filter((item) => item.id !== id) : d.items,
    }));

  // ---- actions --------------------------------------------------------
  function handleSave() {
    const found = validateInvoice(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const cleaned = cleanInvoice(draft);
    onSave(cleaned);
    setDraft(cleaned);
    setBaseline(cleaned);
    setJustSaved(true);
  }

  function handleBack() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    onBack();
  }

  const totals = calcTotals(draft);
  const paid = draft.status === "paid";

  return (
    <div className="space-y-5">
      {/* Top bar (hidden when printing) */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          onClick={handleBack}
          className="rounded-lg border border-line px-3 py-2 text-sm transition hover:border-cyan hover:text-cyan"
        >
          Back
        </button>
        <h2 className="text-lg font-semibold">
          {isSaved ? `Invoice ${draft.number}` : "New invoice"}
        </h2>
        {dirty && <span className="text-xs text-amber-300">Unsaved changes</span>}
        {justSaved && !dirty && <span className="text-xs text-emerald-300">Saved</span>}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => set("status", paid ? "unpaid" : "paid")}
            className="rounded-lg border border-line px-3 py-2 text-sm transition hover:border-emerald-400 hover:text-emerald-300"
          >
            {paid ? "Mark unpaid" : "Mark paid"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-line px-3 py-2 text-sm transition hover:border-cyan hover:text-cyan"
          >
            Print / Save PDF
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            Save invoice
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2 print:block">
        {/* ------------------------- FORM ------------------------- */}
        <div className="space-y-5 print:hidden">
          <Section title="Invoice details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Invoice number" htmlFor="number" error={errors.number}>
                <input
                  id="number"
                  className={inputClass}
                  value={draft.number}
                  onChange={(e) => set("number", e.target.value)}
                />
              </Field>
              <Field label="Currency" htmlFor="currency">
                <select
                  id="currency"
                  className={inputClass}
                  value={draft.currency}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Issue date" htmlFor="issue">
                <input
                  id="issue"
                  type="date"
                  className={`${inputClass} [color-scheme:dark]`}
                  value={draft.issueDate}
                  onChange={(e) => set("issueDate", e.target.value)}
                />
              </Field>
              <Field label="Due date" htmlFor="due" error={errors.dates}>
                <input
                  id="due"
                  type="date"
                  className={`${inputClass} [color-scheme:dark]`}
                  value={draft.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Client">
            <div className="space-y-3">
              <Field label="Client name" htmlFor="client-name" error={errors.client}>
                <input
                  id="client-name"
                  list="known-clients"
                  className={inputClass}
                  placeholder="Start typing to reuse a past client"
                  value={draft.client.name}
                  onChange={(e) => changeClientName(e.target.value)}
                />
                <datalist id="known-clients">
                  {clients.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Client email" htmlFor="client-email">
                  <input
                    id="client-email"
                    type="email"
                    className={inputClass}
                    value={draft.client.email}
                    onChange={(e) => setClient("email", e.target.value)}
                  />
                </Field>
                <Field label="Client address" htmlFor="client-address">
                  <textarea
                    id="client-address"
                    rows={2}
                    className={inputClass}
                    value={draft.client.address}
                    onChange={(e) => setClient("address", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Items">
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_64px_110px_100px_28px] gap-2 px-1 text-xs text-slate-500 sm:grid">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              {draft.items.map((item, index) => (
                <div
                  key={item.id}
                  data-testid="item-row"
                  className="grid grid-cols-[1fr_64px] items-center gap-2 sm:grid-cols-[1fr_64px_110px_100px_28px]"
                >
                  <input
                    aria-label={`Item ${index + 1} description`}
                    className={`${inputClass} col-span-2 sm:col-span-1`}
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  />
                  <input
                    aria-label={`Item ${index + 1} quantity`}
                    type="number"
                    min="0"
                    className={inputClass}
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                  />
                  <input
                    aria-label={`Item ${index + 1} unit price`}
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, "price", e.target.value)}
                  />
                  <span className="text-right text-sm text-slate-300">
                    {formatMoney(lineTotal(item), draft.currency)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() => removeItem(item.id)}
                    disabled={draft.items.length === 1}
                    className="rounded p-1 text-slate-500 transition enabled:hover:text-rose-300 disabled:opacity-30"
                  >
                    x
                  </button>
                </div>
              ))}
              {errors.items && <p className="text-xs text-rose-300">{errors.items}</p>}
              <button
                type="button"
                onClick={addItem}
                className="rounded-lg px-2 py-1.5 text-sm text-cyan transition hover:bg-panel-2"
              >
                + Add item
              </button>
            </div>

            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <Field label="Tax rate (%)" htmlFor="tax">
                <input
                  id="tax"
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={draft.taxRate}
                  onChange={(e) => set("taxRate", e.target.value)}
                />
              </Field>
              <Field label={`Discount (${draft.currency})`} htmlFor="discount">
                <input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={draft.discount}
                  onChange={(e) => set("discount", e.target.value)}
                />
              </Field>
            </div>
            <p className="mt-3 text-right text-sm text-slate-400">
              Total:{" "}
              <span className="font-semibold text-slate-100">
                {formatMoney(totals.total, draft.currency)}
              </span>
            </p>
          </Section>

          <Section title="Notes">
            <textarea
              aria-label="Notes"
              rows={3}
              className={inputClass}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Section>
        </div>

        {/* ------------------------ PREVIEW ------------------------ */}
        <div className="lg:sticky lg:top-6 print:static">
          <InvoicePreview invoice={draft} profile={profile} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      {children}
    </section>
  );
}
