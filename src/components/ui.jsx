// src/components/ui.jsx
// Small shared pieces used across the app.

export const inputClass =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan";

// Label + input + optional error message, so forms stay short and tidy
export function Field({ label, htmlFor, error, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-400">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

const BADGE = {
  paid: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
  unpaid: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
  overdue: "bg-rose-400/10 text-rose-300 ring-rose-400/30",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${BADGE[status]}`}
    >
      {status}
    </span>
  );
}
