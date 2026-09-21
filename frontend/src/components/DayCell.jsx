import calendarStyles from "../styles/calendar.module.css";
import { fmt, getCat } from "../utils";
import styles from "./DayCell.module.css";

const STACK_LAYER_CLASSES = [
  styles.stackLayer0,
  styles.stackLayer1,
  styles.stackLayer2,
];

const getRingGradClass = (count) => {
  if (count >= 3) return styles.ringGradHigh;
  if (count === 2) return styles.ringGradMid;
  return styles.ringGradLow;
};

export default function DayCell({ day, expenses, onClick, isToday }) {
  if (!day) return <div />;

  const hasExpenses = expenses.length > 0;
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const count = expenses.length;
  const stackCount = Math.min(count, 3);
  const stackLayerClasses = STACK_LAYER_CLASSES.slice(3 - stackCount);

  // Empty day
  if (!hasExpenses) {
    return (
      <div
        className={`${calendarStyles.cell} ${isToday ? calendarStyles.cellToday : ""}`}
      >
        <div className={styles.emptyDayNumber}>
          <span
            className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ""}`}
          >
            {day}
          </span>
          {isToday && <div className={styles.todayDot} />}
        </div>
      </div>
    );
  }

  // Day with expenses
  return (
    <div
      onClick={() => onClick(day, expenses)}
      className={`${styles.ringWrap} ${getRingGradClass(count)} ${isToday ? styles.ringWrapToday : ""}`}
    >
      <div className={styles.inner}>
        {/* Stacked photos/cards */}
        {stackLayerClasses.map((layerClass, i) => {
          const expIdx = expenses.length - stackCount + i;
          const exp = expenses[Math.max(0, expIdx)];
          const cat = getCat(exp?.category);
          const isTop = i === stackLayerClasses.length - 1;

          return (
            <div key={i} className={`${styles.stackLayer} ${layerClass}`}>
              {exp?.photo_url ? (
                <img src={exp.photo_url} alt="" className={styles.photo} />
              ) : (
                <div
                  className={styles.photoFallback}
                  style={{ background: cat.color + "22" }}
                >
                  {cat.icon}
                </div>
              )}
              {isTop && <div className={styles.photoShade} />}
            </div>
          );
        })}

        {/* Day number */}
        <div className={styles.dayNumberOverlay}>
          <span
            className={`${styles.dayNumberOverlayText} ${isToday ? styles.dayNumberOverlayTextToday : ""}`}
          >
            {day}
          </span>
          {isToday && <div className={styles.overlayTodayDot} />}
        </div>

        {/* Count badge */}
        {count > 1 && <div className={styles.countBadge}>{count}</div>}

        {/* Amount */}
        <div className={styles.amount}>{fmt(total)}</div>
      </div>
    </div>
  );
}
