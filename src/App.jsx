// src/App.jsx
//
// Two screens: the invoice list and the editor. Instead of a router
// library we keep a simple `view` value in state. (A good stretch
// challenge is to swap this for React Router.)

import { useMemo, useState } from "react";
import InvoiceList from "./components/InvoiceList";
import InvoiceEditor from "./components/InvoiceEditor";
import ProfileModal from "./components/ProfileModal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { createSeedInvoices, seedProfile } from "./data/seed";
import { duplicateInvoice, newInvoice } from "./utils/invoice";

export default function App() {
  const [invoices, setInvoices] = useLocalStorage("invoicedesk-invoices", createSeedInvoices);
  const [profile, setProfile] = useLocalStorage("invoicedesk-profile", seedProfile);

  // null = list screen, otherwise the invoice being edited
  const [editing, setEditing] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Unique clients from past invoices (newest first), used for autofill
  const clients = useMemo(() => {
    const byName = new Map();
    [...invoices]
      .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
      .forEach((inv) => {
        const key = inv.client.name.trim().toLowerCase();
        if (key && !byName.has(key)) byName.set(key, inv.client);
      });
    return [...byName.values()];
  }, [invoices]);

  // ---- every change to the list goes through one of these -----------
  function saveInvoice(invoice) {
    setInvoices((list) =>
      list.some((i) => i.id === invoice.id)
        ? list.map((i) => (i.id === invoice.id ? invoice : i)) // update
        : [invoice, ...list] // add
    );
  }

  function deleteInvoice(id) {
    setInvoices((list) => list.filter((i) => i.id !== id));
  }

  function togglePaid(id) {
    setInvoices((list) =>
      list.map((i) =>
        i.id === id ? { ...i, status: i.status === "paid" ? "unpaid" : "paid" } : i
      )
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel/60 px-6 py-4 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-cyan">Invoice</span>
              <span className="text-indigo">Desk</span>
            </h1>
            <p className="text-xs text-slate-500">Create, track and print invoices</p>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="ml-auto rounded-lg border border-line px-3 py-2 text-sm transition hover:border-cyan hover:text-cyan"
          >
            {profile.name || "Your business"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 print:max-w-none print:p-0">
        {editing ? (
          <InvoiceEditor
            key={editing.id}
            invoice={editing}
            isSaved={invoices.some((i) => i.id === editing.id)}
            clients={clients}
            profile={profile}
            onSave={saveInvoice}
            onBack={() => setEditing(null)}
          />
        ) : (
          <InvoiceList
            invoices={invoices}
            onNew={() => setEditing(newInvoice(invoices, profile))}
            onEdit={setEditing}
            onTogglePaid={togglePaid}
            onDuplicate={(inv) => setEditing(duplicateInvoice(inv, invoices))}
            onDelete={deleteInvoice}
          />
        )}
      </main>

      {showProfile && (
        <ProfileModal
          profile={profile}
          onSave={(p) => {
            setProfile(p);
            setShowProfile(false);
          }}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
