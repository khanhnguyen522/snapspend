import { useState } from "react";
import axios from "axios";
import { modalStyles as m } from "../styles/modal";
import { CATEGORIES } from "../constants";
import { getCat } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "#444",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditModal({ expense, onClose, onSaved, setToast }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    amount: expense.amount,
    store_name: expense.store_name || "",
    category: expense.category || "other",
    note: expense.note || "",
    date: expense.date ? expense.date.split("T")[0] : "",
    paid_by: expense.paid_by || "",
    paidByFriend: !!expense.paid_by && !expense.is_settled,
  });

  const save = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      setError("Enter a valid amount.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("amount", parseFloat(form.amount));
      fd.append("store_name", form.store_name || "Expense");
      fd.append("category", form.category);
      fd.append("note", form.note);
      fd.append("date", form.date);
      fd.append("paid_by", form.paidByFriend ? form.paid_by : "");
      await axios.patch(`${API}/expenses/${expense.id}`, fd);
      setToast("Expense updated");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save.");
    }
    setSaving(false);
  };

  return (
    <div
      style={m.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={m.sheet}>
        <div style={m.handle} />
        <div style={m.sheetHeader}>
          <button onClick={onClose} style={m.backBtn}>
            Cancel
          </button>
          <span style={m.sheetTitle2}>Edit expense</span>
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              color: saving ? "#444" : "#F97316",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div
          style={{
            padding: "16px 20px 40px",
            overflowY: "auto",
            maxHeight: "75vh",
          }}
        >
          <div style={m.amountRow}>
            <span style={m.dollarSign}>$</span>
            <input
              type="number"
              autoFocus
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={m.amountInput}
            />
          </div>

          <Field label="Where">
            <input
              type="text"
              placeholder="Gong Cha, 7-Eleven..."
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              style={m.input}
            />
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={m.input}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getCat(c).icon} {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={m.input}
              />
            </Field>
          </div>

          <Field label="Note (optional)">
            <input
              type="text"
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={m.input}
            />
          </Field>

          <div
            style={{
              ...m.friendBox,
              ...(form.paidByFriend ? m.friendBoxOn : {}),
            }}
            onClick={() =>
              setForm({ ...form, paidByFriend: !form.paidByFriend })
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🤝</span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: form.paidByFriend ? "#F97316" : "#888",
                  }}
                >
                  A friend paid for me
                </div>
                <div style={{ fontSize: 11, color: "#333", marginTop: 1 }}>
                  I'll pay them back later
                </div>
              </div>
            </div>
            <div
              style={{ ...m.toggle, ...(form.paidByFriend ? m.toggleOn : {}) }}
            >
              <div
                style={{ ...m.thumb, ...(form.paidByFriend ? m.thumbOn : {}) }}
              />
            </div>
          </div>

          {form.paidByFriend && (
            <Field label="Friend's name">
              <input
                type="text"
                placeholder="Who paid for you?"
                value={form.paid_by}
                onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
                style={{ ...m.input, borderColor: "#F97316" }}
              />
            </Field>
          )}

          {error && <div style={m.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
