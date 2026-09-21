import { useState } from "react";

import api from "../api";
import { toDateInputValue } from "../utils";
import sheet from "../styles/sheet.module.css";
import Field from "./Field";
import styles from "./EditModal.module.css";

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
      className={sheet.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={sheet.sheet}>
        <div className={sheet.handle} />
        <div className={sheet.sheetHeader}>
          <button onClick={onClose} className={sheet.backBtn}>
            Cancel
          </button>
          <span className={sheet.sheetTitle}>Edit expense</span>
          <button
            onClick={save}
            disabled={saving}
            className={`${sheet.backBtn} ${saving ? styles.saveBtnDisabled : styles.saveBtn}`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <div className={styles.content}>
          <div className={sheet.amountRow}>
            <span className={sheet.dollarSign}>$</span>
            <input
              type="number"
              autoFocus
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={sheet.amountInput}
            />
          </div>
          <Field label="Where">
            <input
              type="text"
              placeholder="Gong Cha, 7-Eleven..."
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className={sheet.input}
            />
          </Field>
          <div className={styles.fieldRow}>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={sheet.input}
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
                className={sheet.input}
              />
            </Field>
          </div>
          <Field label="Note (optional)">
            <input
              type="text"
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={sheet.input}
            />
          </Field>
          {error && <div className={sheet.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
