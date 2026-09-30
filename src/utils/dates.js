// src/utils/dates.js
//
// Dates are stored as plain "YYYY-MM-DD" strings, exactly what
// <input type="date"> gives us. Two good things about that format:
//   1. It survives JSON and localStorage with no conversion.
//   2. It sorts and compares correctly as plain text
//      ("2026-10-01" < "2026-10-15" is true).
//
// We build strings from LOCAL date parts. toISOString() would use UTC,
// which can show "yesterday" late in the evening in Lagos.

const pad = (n) => String(n).padStart(2, "0");

export function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayString() {
  return toDateString(new Date());
}

// "2026-10-01" plus 14 days gives "2026-10-15"
export function addDays(dateString, days) {
  const [y, m, d] = dateString.split("-").map(Number);
  return toDateString(new Date(y, m - 1, d + days));
}

// "2026-10-15" becomes "15 Oct 2026" for display
export function formatDate(dateString) {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
