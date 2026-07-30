import { useState, useRef, useEffect } from "react";
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

  const getBucket = (categoryId) => {
    if (!categoryId) return null;
    return categories.find((b) => b.id === categoryId) || null;
  };

  const bucket = getBucket(e?.category);

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

  const dateStr = e?.date
    ? (() => {
        const [y, m, d] = e.date.split("T")[0].split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
      })()
    : "";

  const photoUrl = e?.photo_url
    ? e.photo_url.startsWith("http")
      ? e.photo_url
      : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${e.photo_url}`
    : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "#000",
        transform: `translateY(${dragY}px)`,
        transition: dragging ? "none" : "transform 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Photo */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#0A0A0A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 48 }}>{bucket?.icon || "📄"}</span>
          </div>
        )}

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(rgba(0,0,0,0.6),transparent)",
            padding: "52px 20px 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                fontSize: 16,
              }}
            >
              ✕
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              {current + 1} / {expenses.length} · {dateStr}
            </span>
            <div style={{ width: 36 }} />
          </div>
        </div>

        {/* Dot indicators */}
        {expenses.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: 110,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {expenses.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === current ? 16 : 4,
                  height: 4,
                  borderRadius: 2,
                  background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
                  transition: "width 0.2s",
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom info */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
            padding: "60px 20px 28px",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-1px",
              marginBottom: 4,
            }}
          >
            ${parseFloat(e?.amount || 0).toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 12,
            }}
          >
            {e?.store_name || "Expense"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {bucket && (
              <span
                style={{
                  fontSize: 12,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  padding: "4px 10px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {bucket.icon} {bucket.name}
              </span>
            )}
            {e?.note && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {e.note}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          background: "#000",
          padding: "16px 20px 40px",
          display: "flex",
          gap: 12,
          borderTop: "1px solid #111",
        }}
      >
        <button
          onClick={() => setShowEdit(true)}
          style={{
            flex: 1,
            background: "#111",
            border: "1px solid #1A1A1A",
            borderRadius: 12,
            padding: "14px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Edit
        </button>
        <button
          onClick={async () => {
            await onDelete(e.id);
            setToast("Deleted");
          }}
          style={{
            flex: 1,
            background: "#7F1D1D22",
            border: "1px solid #7F1D1D",
            borderRadius: 12,
            padding: "14px",
            color: "#F87171",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
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
  );
}
