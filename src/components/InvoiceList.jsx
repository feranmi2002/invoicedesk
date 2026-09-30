// src/components/InvoiceList.jsx
import { useState } from "react";
import StatsBar from "./StatsBar";
import { StatusBadge } from "./ui";
import { calcTotals } from "../utils/calc";
import { getStatus } from "../utils/invoice";
import { formatMoney } from "../utils/format";
import { formatDate } from "../utils/dates";

const FILTERS = ["all", "unpaid", "overdue", "paid"];

export default function InvoiceList({
  invoices,
  onNew,
  onEdit,
  onTogglePaid,
  onDuplicate,
  onDelete,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  // Filtering is DERIVED: we compute the visible list from the full list
  // plus the two filter values. We never keep a second copy in state.
  const visible = invoices
    .filter((inv) => filter === "all" || getStatus(inv) === filter)
    .filter(
      (inv) =>
        !query ||
        inv.client.name.toLowerCase().includes(query) ||
        inv.number.toLowerCase().includes(query)
    )
    .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1)); // newest first

  const action =
    "rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-panel-2 hover:text-cyan";

  return (
    <div className="space-y-6">
      <StatsBar invoices={invoices} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-line bg-panel p-1" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
                filter === f ? "bg-panel-2 text-cyan" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client or number..."
          aria-label="Search invoices"
          className="w-60 rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-cyan"
        />
        <button
          onClick={onNew}
          className="ml-auto rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          + New invoice
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-16 text-center">
          <p className="text-slate-300">
            {invoices.length === 0 ? "No invoices yet." : "No invoices match this view."}
          </p>
          {invoices.length === 0 && (
            <button onClick={onNew} className="mt-3 text-sm text-cyan hover:underline">
              Create your first invoice
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="hidden px-4 pb-2 text-xs uppercase tracking-wide text-slate-500 sm:grid sm:grid-cols-[100px_1fr_110px_110px_130px_90px_auto] sm:gap-3">
            <span>Number</span>
            <span>Client</span>
            <span>Issued</span>
            <span>Due</span>
            <span className="text-right">Total</span>
            <span>Status</span>
            <span className="w-[290px]" />
          </div>
          <ul className="space-y-2">
            {visible.map((inv) => {
              const status = getStatus(inv);
              const { total } = calcTotals(inv);
              return (
                <li
                  key={inv.id}
                  data-testid="invoice-row"
                  className="grid items-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 sm:grid-cols-[100px_1fr_110px_110px_130px_90px_auto] sm:gap-3"
                >
                  <span className="font-mono text-sm text-indigo">{inv.number}</span>
                  <span className="truncate text-sm font-medium">{inv.client.name}</span>
                  <span className="text-sm text-slate-400">
                    <span className="sm:hidden">Issued </span>
                    {formatDate(inv.issueDate)}
                  </span>
                  <span className="text-sm text-slate-400">
                    <span className="sm:hidden">Due </span>
                    {formatDate(inv.dueDate)}
                  </span>
                  <span className="text-sm font-semibold sm:text-right">
                    {formatMoney(total, inv.currency)}
                  </span>
                  <span>
                    <StatusBadge status={status} />
                  </span>
                  <span className="flex flex-wrap items-center gap-1 sm:w-[290px] sm:justify-end">
                    <button className={action} onClick={() => onEdit(inv)}>
                      Open
                    </button>
                    <button className={action} onClick={() => onTogglePaid(inv.id)}>
                      {inv.status === "paid" ? "Mark unpaid" : "Mark paid"}
                    </button>
                    <button className={action} onClick={() => onDuplicate(inv)}>
                      Duplicate
                    </button>
                    <button
                      className={`${action} hover:!text-rose-300`}
                      aria-label={`Delete ${inv.number}`}
                      onClick={() => {
                        if (window.confirm(`Delete ${inv.number} for ${inv.client.name}?`)) {
                          onDelete(inv.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
