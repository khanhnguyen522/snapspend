import { useState } from "react";

import { ICONS } from "../constants";

// Shared "create a bucket" form used by both AddModal (expense flow) and
// OverviewPage (buckets list). `fullscreen` picks which of the two original
// wrapper styles to use; the form itself was previously duplicated in full.
export default function NewBucketModal({
  onSave,
  onClose,
  fullscreen = false,
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💰");
  const [budget, setBudget] = useState("");

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      icon,
      budget: budget ? parseFloat(budget) : 0,
    });
    onClose();
  };

  const overlayStyle = fullscreen
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        animation: "slideUp 0.2s ease",
        touchAction: "none",
      }
    : {
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        touchAction: "none",
      };

  const sheetStyle = fullscreen
    ? { flex: 1, display: "flex", flexDirection: "column" }
    : {
        width: "100%",
        maxWidth: 480,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.2s ease",
      };

  return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
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
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
            New bucket
          </span>
          <button onClick={save} style={addBtnStyle}>
            Add
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px 48px",
            touchAction: "pan-y",
          }}
        >
          <p style={labelStyle}>Name</p>
          <input
            type="text"
            placeholder="e.g. Groceries, Rent, Savings..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={nameInputStyle}
          />

          <p style={labelStyle}>Monthly budget (optional)</p>
          <div style={budgetRowStyle}>
            <span style={{ fontSize: 24, color: "#333" }}>$</span>
            <input
              type="number"
              placeholder="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={budgetInputStyle}
            />
          </div>

          <p style={labelStyle}>Icon</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 8,
            }}
          >
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                style={{
                  background: icon === i ? "#F9731620" : "#0A0A0A",
                  border: `1.5px solid ${icon === i ? "#F97316" : "#1A1A1A"}`,
                  borderRadius: 12,
                  padding: "10px 0",
                  fontSize: 22,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "12px 20px 36px",
            borderTop: "1px solid #111",
            flexShrink: 0,
          }}
        >
          <button
            onClick={save}
            disabled={!name.trim()}
            style={{
              width: "100%",
              padding: "16px",
              background: name.trim()
                ? "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)"
                : "#111",
              border: "none",
              borderRadius: 14,
              color: name.trim() ? "#fff" : "#333",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {name.trim() ? `Add "${name}" bucket` : "Enter a name"}
          </button>
        </div>
      </div>
    </div>
  );
}

const cancelBtnStyle = {
  background: "none",
  border: "none",
  color: "#555",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
};

const addBtnStyle = {
  background: "none",
  border: "none",
  color: "#F97316",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "#444",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 12,
};

const nameInputStyle = {
  width: "100%",
  background: "#0A0A0A",
  border: "1px solid #1A1A1A",
  borderRadius: 12,
  padding: "14px 16px",
  fontSize: 15,
  color: "#fff",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  marginBottom: 24,
  boxSizing: "border-box",
};

const budgetRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 24,
  paddingBottom: 20,
  borderBottom: "1px solid #111",
};

const budgetInputStyle = {
  flex: 1,
  fontSize: 28,
  fontWeight: 700,
  color: "#fff",
  border: "none",
  outline: "none",
  background: "none",
  fontFamily: "Inter, sans-serif",
};
