// src/hooks/useLocalStorage.js
//
// A CUSTOM HOOK: a function whose name starts with "use" that calls other
// hooks. It works exactly like useState, but the value is also saved in
// the browser, so it survives a page refresh.
//
//   const [invoices, setInvoices] = useLocalStorage("my-key", []);
//
// `initial` can be a value or a function that returns one. A function is
// only called when nothing is saved yet (handy for big seed data).

import { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  // Lazy initialiser: this function runs ONCE, on the first render only
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Blocked or corrupt storage: fall back to the initial value
    }
    return typeof initial === "function" ? initial() : initial;
  });

  // Write to storage after every change to `value`
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or disabled: the app keeps working, it just will not persist
    }
  }, [key, value]);

  return [value, setValue];
}
