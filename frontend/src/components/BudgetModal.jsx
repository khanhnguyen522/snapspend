import { useState, useEffect } from "react";
import axios from "axios";
import { modalStyles as m } from "../styles/modal";
import { CATEGORIES } from "../constants";
import { getCat } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function BudgetModal({ current, onClose, onSaved, setToast }) {
  const [overall, setOverall] = useState(String(current));
  const [catBudgets, setCatBudgets] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/category-budgets`)
      .then((res) => setCatBudgets(res.data.budgets || {}))
      .catch(() => {});
  }, []);

  const save = async () => {
    const n = parseFloat(overall);
    if (isNaN(n) || n <= 0) return;
    setSaving(true);
    try {
      await axios.put(`${API}/budget`, { budget: n });
      await axios.put(`${API}/category-budgets`, { budgets: catBudgets });
      setToast("Budget updated");
      onSaved();
      onClose();
    } catch {}
    setSaving(false);
  };

  const setCat = (cat, val) => {
    setCatBudgets((prev) => ({ ...prev, [cat]: val }));
  };

  return (
    <div
      style={m.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...m.sheet, padding: "0 0 32px" }}>
        <div style={m.handle} />
        <div style={m.sheetHeader}>
          <button onClick={onClose} style={m.backBtn}>
            Cancel
          </button>
          <span style={m.sheetTitle2}>Budget settings</span>
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: "none",
              border: "none",
              color: "#F97316",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div
          style={{ padding: "0 20px", overflowY: "auto", maxHeight: "75vh" }}
        >
          {/* Overall budget */}
          <div
            style={{
              paddingTop: 20,
              marginBottom: 24,
              borderBottom: "1px solid #111",
              paddingBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              Overall monthly budget
            </p>
            <div style={m.amountRow}>
              <span style={m.dollarSign}>$</span>
              <input
                type="number"
                autoFocus
                value={overall}
                onChange={(e) => setOverall(e.target.value)}
                style={m.amountInput}
              />
            </div>
            <p style={{ fontSize: 12, color: "#333", marginTop: 4 }}>
              Your total monthly spending limit.
            </p>
          </div>

          {/* Per category budgets */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Category limits
            </p>
            <p style={{ fontSize: 12, color: "#333", marginBottom: 16 }}>
              Leave blank for no limit.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CATEGORIES.map((cat) => {
                const config = getCat(cat);
                return (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#111",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid #1A1A1A",
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {config.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#888",
                        flex: 1,
                        textTransform: "capitalize",
                      }}
                    >
                      {cat}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <span style={{ fontSize: 13, color: "#333" }}>$</span>
                      <input
                        type="number"
                        placeholder="—"
                        value={catBudgets[cat] || ""}
                        onChange={(e) => setCat(cat, e.target.value)}
                        style={{
                          width: 70,
                          background: "none",
                          border: "none",
                          outline: "none",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "Inter, sans-serif",
                          textAlign: "right",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
