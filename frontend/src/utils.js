import { CATEGORY_CONFIG } from "./constants";

export const getCat = (cat) =>
  CATEGORY_CONFIG[cat?.toLowerCase()] || CATEGORY_CONFIG.other;

export const fmt = (val) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val || 0);

export const today = () => new Date().toISOString().split("T")[0];
