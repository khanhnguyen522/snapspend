import { useState } from "react";

import api from "../api";
import { toDateInputValue } from "../utils";
import { modalStyles as m } from "../styles/modal";
import Field from "./Field";

export default function EditModal({
  expense,
  categories,
  onClose,
  onSaved,
  setToast,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    amount: expense.amount,
    store_name: expense.store_name || "",
    category: expense.category || "",
    note: expense.note || "",
    date: toDateInputValue(expense.date),
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
      await api.patch(`/expenses/${expense.id}`, fd);
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
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
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
          {error && <div style={m.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
