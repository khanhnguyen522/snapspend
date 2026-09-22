import { fmt, fmtDate, getCat } from "../utils";
import styles from "./PhotoFeed.module.css";

export default function PhotoFeed({
  expenses,
  categories = [],
  onSelectExpense,
}) {
  const sorted = [...expenses].sort(
    (a, b) =>
      (b.date || "").localeCompare(a.date || "") ||
      (b.created_at || "").localeCompare(a.created_at || ""),
  );

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>📸</p>
        <p className={styles.emptyText}>No expenses this month yet</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {sorted.map((exp) => {
        const cat = getCat(exp.category);
        const bucket = categories.find((b) => b.id === exp.category);
        return (
          <div
            key={exp.id}
            className={styles.slide}
            onClick={() => onSelectExpense(exp)}
          >
            <div className={styles.photoArea}>
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
            </div>
            <div className={styles.info}>
              <div className={styles.headerRow}>
                <p className={styles.amount}>{fmt(exp.amount)}</p>
                <span className={styles.dateTag}>
                  {fmtDate(exp.date, { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className={styles.store}>{exp.store_name || "Expense"}</p>
              {exp.note && <p className={styles.note}>{exp.note}</p>}
              <div className={styles.tagRow}>
                <span className={styles.bucketTag}>
                  {bucket ? `${bucket.icon} ${bucket.name}` : "Uncategorized"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
