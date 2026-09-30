// src/components/StatsBar.jsx
import { computeStats } from "../utils/invoice";
import { formatTotals } from "../utils/format";

export default function StatsBar({ invoices }) {
  // Derived on every render from the invoices. We never store these numbers.
  const stats = computeStats(invoices);

  const cards = [
    { label: "Outstanding", value: formatTotals(stats.outstanding), tone: "text-amber-300" },
    {
      label: "Overdue",
      value: formatTotals(stats.overdue),
      tone: Object.keys(stats.overdue).length ? "text-rose-300" : "text-slate-300",
    },
    { label: "Paid", value: formatTotals(stats.paid), tone: "text-emerald-300" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-line bg-panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className={`mt-1 text-xl font-semibold ${c.tone}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
