import { useEffect, useRef, useState } from "react";

import { API_BASE_URL } from "../api";
import { fmtDate } from "../utils";
import styles from "./DaySheet.module.css";
import EditModal from "./EditModal";

export default function DaySheet({
  day,
  expenses,
  month,
  year,
  onClose,
  onDelete,
  onSaved,
  setToast,
  categories = [],
}) {
  const [current, setCurrent] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);
  const didDrag = useRef(false);
  const isHoriz = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!expenses || expenses.length === 0) return null;

  const e = expenses[current];
  const bucket = categories?.find((b) => b.id === e?.category) || null;

  const onTouchStart = (ev) => {
    touchStartY.current = ev.touches[0].clientY;
    touchStartX.current = ev.touches[0].clientX;
    didDrag.current = false;
    isHoriz.current = false;
    setDragging(false);
    setDragY(0);
  };

  const onTouchMove = (ev) => {
    if (!touchStartY.current) return;
    const dy = ev.touches[0].clientY - touchStartY.current;
    const dx = ev.touches[0].clientX - touchStartX.current;

    if (!didDrag.current) {
      isHoriz.current = Math.abs(dx) > Math.abs(dy);
      didDrag.current = true;
    }

    if (isHoriz.current) {
      ev.preventDefault();
      return;
    }

    if (dy > 0) {
      ev.preventDefault();
      setDragging(true);
      setDragY(dy);
    }
  };

  const onTouchEnd = (ev) => {
    if (isHoriz.current) {
      const dx = ev.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 50) {
        if (dx < 0 && current < expenses.length - 1) setCurrent((c) => c + 1);
        if (dx > 0 && current > 0) setCurrent((c) => c - 1);
      }
      touchStartY.current = null;
      return;
    }

    if (dragging && dragY > 100) {
      onClose();
    } else {
      setDragY(0);
      setDragging(false);
    }
    touchStartY.current = null;
  };

  const dateStr = fmtDate(e?.date, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const photoUrl = e?.photo_url
    ? e.photo_url.startsWith("http")
      ? e.photo_url
      : `${API_BASE_URL}${e.photo_url}`
    : null;

  return (
    <div
      className={styles.overlay}
      onClick={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div
        className={styles.sheet}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Photo */}
        <div className={styles.photoArea}>
          {photoUrl ? (
            <img src={photoUrl} alt="" className={styles.photo} />
          ) : (
            <div className={styles.photoFallback}>
              <span className={styles.photoFallbackIcon}>
                {bucket?.icon || "📄"}
              </span>
            </div>
          )}

          {/* Top bar */}
          <div className={styles.topBar}>
            <div className={styles.topBarRow}>
              <button onClick={onClose} className={styles.closeBtn}>
                ✕
              </button>
              <span className={styles.topBarLabel}>
                {current + 1} / {expenses.length} · {dateStr}
              </span>
              <div className={styles.topBarSpacer} />
            </div>
          </div>
          {/* Left/right tap zones for desktop */}
          {current > 0 && (
            <div
              onClick={() => setCurrent((c) => c - 1)}
              className={styles.tapZoneLeft}
            />
          )}
          {current < expenses.length - 1 && (
            <div
              onClick={() => setCurrent((c) => c + 1)}
              className={styles.tapZoneRight}
            />
          )}
          {/* Dot indicators */}
          {expenses.length > 1 && (
            <div className={styles.dots}>
              {expenses.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                />
              ))}
            </div>
          )}

          {/* Bottom info */}
          <div className={styles.bottomInfo}>
            <div className={styles.amount}>
              ${parseFloat(e?.amount || 0).toFixed(2)}
            </div>
            <div className={styles.storeName}>{e?.store_name || "Expense"}</div>
            <div className={styles.tagRow}>
              {bucket && (
                <span className={styles.bucketTag}>
                  {bucket.icon} {bucket.name}
                </span>
              )}
              {e?.note && <span className={styles.noteTag}>{e.note}</span>}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            onClick={() => setShowEdit(true)}
            className={`${styles.actionBtn} ${styles.editBtn}`}
          >
            Edit
          </button>
          <button
            onClick={async () => {
              await onDelete(e.id);
              setToast("Deleted");
            }}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
          >
            Delete
          </button>
        </div>

        {showEdit && (
          <EditModal
            expense={e}
            onClose={() => setShowEdit(false)}
            onSaved={onSaved}
            setToast={setToast}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
}
