import { useEffect, useState } from "react";

import api from "../api";
import { CATEGORIES } from "../constants";
import { getCat } from "../utils";
import styles from "./BudgetModal.module.css";

export default function BudgetModal({ current, onClose, onSaved, setToast }) {
  const [overall, setOverall] = useState(String(current));
  const [catBudgets, setCatBudgets] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    api
      .get("/category-budgets")
      .then((res) => setCatBudgets(res.data.budgets || {}))
      .catch(() => {});
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  const save = async () => {
    const n = parseFloat(overall);
    if (isNaN(n) || n <= 0) return;
    setSaving(true);
    try {
      await api.put("/budget", { budget: n });
      await api.put("/category-budgets", { budgets: catBudgets });
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
    <div className={styles.screen}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.cancelBtn}>
          Cancel
        </button>
        <h2 className={styles.title}>Budget settings</h2>
        <button onClick={save} disabled={saving} className={styles.saveBtn}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className={styles.content}>
        {/* Overall budget */}
        <div className={styles.overallSection}>
          <p className={styles.sectionLabel}>Overall monthly budget</p>
          <div className={styles.overallRow}>
            <span className={styles.overallSign}>$</span>
            <input
              type="number"
              autoFocus
              value={overall}
              onChange={(e) => setOverall(e.target.value)}
              className={styles.overallInput}
            />
          </div>
          <p className={styles.hint}>Your total monthly spending limit.</p>
        </div>

        {/* Category limits */}
        <div>
          <p className={styles.categoryLabel}>Category limits</p>
          <p className={styles.categoryHint}>Leave blank for no limit.</p>
          <div className={styles.categoryList}>
            {CATEGORIES.map((cat) => {
              const config = getCat(cat);
              return (
                <div key={cat} className={styles.categoryRow}>
                  <span className={styles.categoryIcon}>{config.icon}</span>
                  <span className={styles.categoryName}>{cat}</span>
                  <div className={styles.categoryAmount}>
                    <span className={styles.categorySign}>$</span>
                    <input
                      type="number"
                      placeholder="—"
                      value={catBudgets[cat] || ""}
                      onChange={(e) => setCat(cat, e.target.value)}
                      className={styles.categoryInput}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className={`${styles.submitBtn} ${saving ? styles.submitBtnSaving : ""}`}
        >
          {saving ? "Saving..." : "Save budget"}
        </button>
      </div>
    </div>
  );
}
