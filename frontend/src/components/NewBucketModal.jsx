import { useState } from "react";

import { ICONS } from "../constants";
import styles from "./NewBucketModal.module.css";

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

  const hasName = !!name.trim();

  return (
    <div
      className={fullscreen ? styles.overlayFullscreen : styles.overlayCentered}
    >
      <div
        className={fullscreen ? styles.sheetFullscreen : styles.sheetCentered}
      >
        <div className={styles.header}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <span className={styles.title}>New bucket</span>
          <button onClick={save} className={styles.addBtn}>
            Add
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.label}>Name</p>
          <input
            type="text"
            placeholder="e.g. Groceries, Rent, Savings..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className={styles.nameInput}
          />

          <p className={styles.label}>Monthly budget (optional)</p>
          <div className={styles.budgetRow}>
            <span className={styles.budgetSign}>$</span>
            <input
              type="number"
              placeholder="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={styles.budgetInput}
            />
          </div>

          <p className={styles.label}>Icon</p>
          <div className={styles.iconGrid}>
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`${styles.iconBtn} ${icon === i ? styles.iconBtnActive : ""}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            onClick={save}
            disabled={!hasName}
            className={`${styles.submitBtn} ${hasName ? styles.submitBtnActive : ""}`}
          >
            {hasName ? `Add "${name}" bucket` : "Enter a name"}
          </button>
        </div>
      </div>
    </div>
  );
}
