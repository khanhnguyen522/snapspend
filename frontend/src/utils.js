import { CATEGORY_CONFIG } from "./constants";

export const fmt = (val) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val || 0);

// Formats a "YYYY-MM-DD" (or ISO) date string for display, e.g. "Jan 5".
export const fmtDate = (
  dateStr,
  options = { month: "short", day: "numeric" },
) => {
  const d = parseLocalDate(dateStr);
  return d ? d.toLocaleDateString("en-US", options) : "";
};

export const getCat = (cat) =>
  CATEGORY_CONFIG[cat?.toLowerCase()] || CATEGORY_CONFIG.other;

// Parses a "YYYY-MM-DD" (or ISO) date string as a local Date, avoiding the
// UTC-shift bugs that `new Date(dateStr)` causes near midnight.
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Converts a date string to the "YYYY-MM-DD" value a <input type="date"> expects.
export const toDateInputValue = (dateStr) =>
  dateStr ? dateStr.split("T")[0] : "";

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
