import styles from "./HelpModal.module.css";

export default function HelpModal({ onClose }) {
  const sections = [
    {
      icon: "📸",
      title: "Adding an expense",
      body: 'Tap the camera button to add an expense. Snap a receipt and Claude reads the amount, store, and date for you — or choose "Add amount" to enter everything manually.',
    },
    {
      icon: "🪣",
      title: "Buckets",
      body: "Buckets are your spending categories (Rent, Groceries, etc.). Create your own from the Overview tab or right when adding an expense. Every expense belongs to one bucket.",
    },
    {
      icon: "🎯",
      title: "Budgets",
      body: "Give any bucket a monthly budget and it'll track how much you have left as you spend. The Overview tab shows your overall budget progress plus each bucket's individual progress bar.",
    },
    {
      icon: "✏️",
      title: "Editing & deleting",
      body: "Tap any day on the calendar to see that day's expenses. From there you can edit details (amount, bucket, note, date) or delete the expense entirely.",
    },
    {
      icon: "🗑️",
      title: "Deleting a bucket",
      body: "If a bucket still has expenses linked to it, deleting it will ask you to move those expenses to another bucket first — nothing gets deleted or lost by accident.",
    },
  ];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.sheet}>
        <div className={styles.header}>
          <span className={styles.title}>How Snapspend works</span>
          <button onClick={onClose} className={styles.doneBtn}>
            Done
          </button>
        </div>

        <div className={styles.sections}>
          {sections.map((s, i) => (
            <div
              key={i}
              className={`${styles.section} ${i === sections.length - 1 ? styles.sectionLast : ""}`}
            >
              <div className={styles.iconBox}>{s.icon}</div>
              <div>
                <p className={styles.sectionTitle}>{s.title}</p>
                <p className={styles.sectionBody}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
