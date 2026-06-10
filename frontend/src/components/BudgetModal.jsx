import { useState } from "react";
import axios from "axios";
import { modalStyles as m } from "../styles/modal";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function BudgetModal({ current, onClose, onSaved, setToast }) {
  const [val, setVal] = useState(String(current));

  const save = async () => {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) return;
    await axios.put(`${API}/budget`, { budget: n });
    setToast("Budget updated");
    onSaved();
    onClose();
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
          <span style={m.sheetTitle2}>Monthly budget</span>
          <button
            onClick={save}
            style={{
              background: "none",
              border: "none",
              color: "#60A5FA",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
        <div style={{ padding: "24px 20px 0" }}>
          <div style={m.amountRow}>
            <span style={m.dollarSign}>$</span>
            <input
              type="number"
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              style={m.amountInput}
            />
          </div>
          <p style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
            Sets your monthly spending limit. You'll see a warning when you're
            close.
          </p>
        </div>
      </div>
    </div>
  );
}
