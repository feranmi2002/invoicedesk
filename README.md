# InvoiceDesk: an invoice generator in React

A real-life, frontend-only project. Freelancers, agencies and small shops
send invoices every week, so this is something the student can actually use
and show to a client. There is no backend and no API key. Data is saved in
the browser.

## Run it (Windows, VS Code terminal)

```
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

Run the unit tests for the money logic:

```
npm test
```

## What it does

- Dashboard: outstanding, overdue and paid totals, shown per currency
- Invoice list with status tabs (all, unpaid, overdue, paid) and search
- Create, edit, duplicate, delete and mark invoices as paid
- Line items with quantity and price, discount, tax rate, notes
- Live paper preview that updates as you type
- **Print / Save PDF**: prints only the invoice, laid out for A4
- Client autofill: type a past client's name and their email and address fill in
- "Your business" details (name, address, bank details, default tax) saved once
- Automatic invoice numbers (INV-0006 after INV-0005)
- Validation with clear messages, unsaved-changes warning
- Everything survives a page refresh (localStorage)

## Why this is a step up from the earlier apps

| Earlier apps | InvoiceDesk |
| --- | --- |
| Data comes from an API | The student designs and owns the data |
| Search and display | Forms with validation, edit vs create |
| Logic inside components | Business logic in pure functions, with tests |
| Plain useState | A custom hook (useLocalStorage) |
| Screen only | Print layout for a real PDF document |
| One list of things | Derived state (status, totals, stats) |

## Folder tour

```
src/
  data/seed.js               sample business and 5 sample invoices
  hooks/useLocalStorage.js   custom hook: useState that survives refresh
  utils/
    calc.js                  money maths (pure functions)
    invoice.js               numbering, status, validation, dashboard stats
    dates.js                 date strings, add days, formatting
    format.js                currency formatting with Intl
  components/
    InvoiceList.jsx          filters, search, row actions
    StatsBar.jsx             outstanding / overdue / paid cards
    InvoiceEditor.jsx        the form (works on a draft copy)
    InvoicePreview.jsx       the paper invoice (screen AND print)
    ProfileModal.jsx         your business details
    ui.jsx                   Field wrapper and status badge
  App.jsx                    list or editor screen, save/delete/toggle handlers
tests/invoice.test.js        8 tests, run with npm test
```

## Suggested teaching order (about 3 sessions)

**Session 1: Data and maths, no React.** Open `calc.js` and `invoice.js`.
Have the student write `lineTotal` and `calcTotals` first and run the tests
with `npm test`. Ask why the tests can run without a browser (the functions
are pure). Ask why 0.1 + 0.2 is a problem on an invoice.

**Session 2: The list and the editor.** Build `InvoiceList` from the seed
data, then the editor form. The big idea is the **draft copy**: the form
edits local state, and only Save writes to the list. Add validation last.

**Session 3: Preview, print and persistence.** Build `InvoicePreview`, then
the `useLocalStorage` hook. Finally add the print layout. Show the student
the `print:hidden` classes and explain that the browser uses a different
"media" for printing.

## Concepts to check understanding of

1. Why is "overdue" never stored on the invoice? What would go wrong?
2. Why do we compare dates as "YYYY-MM-DD" text, and why does that work?
3. Why must you never add naira and dollars together? Where does the app avoid it?
4. Why does the editor copy the invoice into a draft instead of editing it directly?
5. In `useLocalStorage`, why is the initial value a function, and when does it run?
6. Why do qty and price stay as strings in state, and where are they turned into numbers?
7. What does the cleanup function in the "Saved" timer `useEffect` prevent?
8. Why is the invoice number taken from the highest number and not from the count?

## Stretch challenges (pick one or two)

1. **Logo upload.** Let the user pick an image, read it with `FileReader`, store it as a
   base64 string in the profile, and show it on the invoice.
2. **Payment status history.** Record the date an invoice was marked paid and show it on the invoice.
3. **Per-line tax or discount percentage** instead of one rate for the whole invoice.
4. **Recurring invoices.** A "Repeat monthly" option that creates the next draft.
5. **Export and import** all invoices as a JSON file (a simple backup).
6. **Send by WhatsApp.** A button that opens `https://wa.me/<number>?text=...` with the
   amount and due date filled in. Very common in Nigerian business.
7. **Replace the `editing` state with React Router** so each invoice has its own URL.
8. **Write more tests** for edge cases: empty invoice, huge quantities, 100% discount.

## Deploy

```
npm run build
```

Upload the `dist` folder to Vercel or Netlify. No environment variables needed.

## Notes

- All names, emails and bank details in the sample data are made up.
- Printing: in the print dialog choose "Save as PDF" and turn on "Background
  graphics" if the dark total bar does not appear.
