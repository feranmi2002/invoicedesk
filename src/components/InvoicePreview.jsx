// src/components/InvoicePreview.jsx
//
// The paper version of the invoice. The editor shows it live, and the
// browser prints it. It only receives data through props, so the same
// component is used for the screen preview AND the printed PDF.

import { calcTotals, lineTotal } from "../utils/calc";
import { getStatus } from "../utils/invoice";
import { formatMoney } from "../utils/format";
import { formatDate } from "../utils/dates";

export default function InvoicePreview({ invoice, profile }) {
  const totals = calcTotals(invoice);
  const status = getStatus(invoice);
  const money = (n) => formatMoney(n, invoice.currency);
  const rows = invoice.items.filter((item) => item.description.trim());

  return (
    <article
      id="invoice-print"
      data-testid="invoice-preview"
      className="relative overflow-hidden rounded-xl bg-white p-5 text-sm text-slate-800 shadow-2xl sm:p-8 print:rounded-none print:p-0 print:shadow-none"
    >
      {status === "paid" && (
        <div className="pointer-events-none absolute right-8 top-24 -rotate-12 rounded-lg border-4 border-emerald-500/60 px-4 py-1 text-3xl font-black tracking-widest text-emerald-500/60">
          PAID
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {profile.name || "Your business name"}
          </h2>
          <div className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-500">
            {[profile.address, profile.email, profile.phone].filter(Boolean).join("\n")}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tracking-widest text-indigo-500">INVOICE</p>
          <p className="mt-1 font-mono text-sm text-slate-600">{invoice.number}</p>
        </div>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bill to</p>
          <p className="mt-1 font-semibold text-slate-900">
            {invoice.client.name || "Client name"}
          </p>
          <div className="whitespace-pre-line text-xs leading-relaxed text-slate-500">
            {[invoice.client.address, invoice.client.email].filter(Boolean).join("\n")}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-y-1 text-xs sm:text-right">
          <dt className="text-slate-400">Issue date</dt>
          <dd className="font-medium text-slate-700">{formatDate(invoice.issueDate)}</dd>
          <dt className="text-slate-400">Due date</dt>
          <dd className="font-medium text-slate-700">{formatDate(invoice.dueDate)}</dd>
          <dt className="text-slate-400">Status</dt>
          <dd className="font-medium capitalize text-slate-700">{status}</dd>
        </dl>
      </section>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 text-right font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Unit price</th>
              <th className="px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-400">
                  Items will appear here as you add them.
                </td>
              </tr>
            )}
            {rows.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-3 py-2.5">{item.description}</td>
                <td className="px-3 py-2.5 text-right">{item.qty}</td>
                <td className="px-3 py-2.5 text-right">{money(Number(item.price) || 0)}</td>
                <td className="px-3 py-2.5 text-right font-medium">{money(lineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
        <Row label="Subtotal" value={money(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Discount" value={`-${money(totals.discount)}`} />}
        <Row label={`Tax (${Number(invoice.taxRate) || 0}%)`} value={money(totals.tax)} />
        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2.5 text-white">
          <span className="font-semibold">Total due</span>
          <span className="text-lg font-bold">{money(totals.total)}</span>
        </div>
      </div>

      {(profile.paymentDetails || invoice.notes) && (
        <footer className="mt-8 grid gap-6 border-t border-slate-200 pt-5 text-xs sm:grid-cols-2">
          {profile.paymentDetails && (
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400">
                Payment details
              </p>
              <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-600">
                {profile.paymentDetails}
              </p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400">Notes</p>
              <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-600">
                {invoice.notes}
              </p>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 text-slate-600">
      <span>{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
