import { CATEGORY_CONFIG } from "./constants";

export const getCat = (cat) =>
  CATEGORY_CONFIG[cat?.toLowerCase()] || CATEGORY_CONFIG.other;

export const fmt = (val) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val || 0);

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
