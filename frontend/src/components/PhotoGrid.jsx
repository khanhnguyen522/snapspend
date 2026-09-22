import { fmt, getCat } from "../utils";
import styles from "./PhotoGrid.module.css";

export default function PhotoGrid({ expenses, onSelectExpense }) {
  const sorted = [...expenses].sort(
    (a, b) =>
      (b.date || "").localeCompare(a.date || "") ||
      (b.created_at || "").localeCompare(a.created_at || ""),
  );

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>🖼️</p>
        <p className={styles.emptyText}>No expenses this month yet</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {sorted.map((exp) => {
        const cat = getCat(exp.category);
        return (
          <div
            key={exp.id}
            className={styles.cell}
            onClick={() => onSelectExpense(exp)}
          >
            {exp.photo_url ? (
              <img src={exp.photo_url} alt="" className={styles.photo} />
            ) : (
              <div
                className={styles.fallback}
                style={{ background: cat.color + "22" }}
              >
                {cat.icon}
              </div>
            )}
            <span className={styles.amount}>{fmt(exp.amount)}</span>
          </div>
        );
      })}
    </div>
  );
}
