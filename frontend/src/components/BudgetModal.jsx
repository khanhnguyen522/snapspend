import { useState, useEffect } from "react";
import axios from "axios";
import { CATEGORIES } from "../constants";
import { getCat } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function BudgetModal({ current, onClose, onSaved, setToast }) {
  const [overall, setOverall] = useState(String(current));
  const [catBudgets, setCatBudgets] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    axios
      .get(`${API}/category-budgets`)
      .then((res) => setCatBudgets(res.data.budgets || {}))
      .catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.25s ease",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: none; } }`}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "52px 20px 16px",
          borderBottom: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cancel
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
          Budget settings
        </h2>
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

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 48px" }}>
        {/* Overall budget */}
        <div
          style={{
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: "1px solid #111",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 16,
            }}
          >
            Overall monthly budget
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 300, color: "#333" }}>
              $
            </span>
            <input
              type="number"
              autoFocus
              value={overall}
              onChange={(e) => setOverall(e.target.value)}
              style={{
                flex: 1,
                fontSize: 38,
                fontWeight: 700,
                color: "#fff",
                border: "none",
                outline: "none",
                background: "none",
                letterSpacing: "-0.5px",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "#333" }}>
            Your total monthly spending limit.
          </p>
        </div>

        {/* Category limits */}
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
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
                    background: "#0A0A0A",
                    borderRadius: 12,
                    padding: "14px 16px",
                    border: "1px solid #1A1A1A",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>
                    {config.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
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
                    <span style={{ fontSize: 14, color: "#333" }}>$</span>
                    <input
                      type="number"
                      placeholder="—"
                      value={catBudgets[cat] || ""}
                      onChange={(e) => setCat(cat, e.target.value)}
                      style={{
                        width: 80,
                        background: "none",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        fontSize: 16,
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

        {/* Save button at bottom */}
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: "100%",
            marginTop: 32,
            padding: "16px",
            background: "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)",
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving..." : "Save budget"}
        </button>
      </div>
    </div>
  );
}
