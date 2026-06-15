import { useState, useRef } from "react";
import { getCat, fmt } from "../utils";
import EditModal from "./EditModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function DaySheet({
  day,
  expenses,
  month,
  year,
  onClose,
  onSettle,
  onDelete,
  onSaved,
  setToast,
}) {
  const [index, setIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(null);
  const touchStart = useRef(null);
  const didDrag = useRef(false);

  const label = new Date(year, month, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!expenses || expenses.length === 0) {
    onClose();
    return null;
  }

  const e = expenses[index] || expenses[0];
  const cat = getCat(e?.category || "other");
  const isDebt = e.paid_by && !e.is_settled;
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  const goNext = () => {
    if (index < expenses.length - 1) setIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const onTouchStart = (ev) => {
    touchStart.current = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    didDrag.current = false;
    setDragging(false);
    setDragY(0);
  };

  const onTouchMove = (ev) => {
    if (!touchStart.current) return;
    const dy = ev.touches[0].clientY - touchStart.current.y;
    const dx = Math.abs(ev.touches[0].clientX - touchStart.current.x);
    if (dy > 10 && dy > dx) {
      ev.preventDefault();
      didDrag.current = true;
      setDragging(true);
      setDragY(Math.max(0, dy));
    }
  };

  const onTouchEnd = (ev) => {
    ev.preventDefault();
    if (!touchStart.current) return;
    const t = ev.changedTouches[0];
    const dy = t.clientY - touchStart.current.y;

    if (didDrag.current && dy > 120) {
      onClose();
    } else if (!didDrag.current) {
      const mid = window.innerWidth / 2;
      if (t.clientX < mid) goPrev();
      else goNext();
    }

    setDragY(0);
    setDragging(false);
    touchStart.current = null;
    didDrag.current = false;
  };

  const progress = Math.min(dragY / 300, 1);
  const scale = 1 - progress * 0.15;
  const borderRadius = progress * 24;
  const bgOpacity = 1 - progress * 0.5;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: `rgba(0,0,0,${bgOpacity})`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            transform: `translateY(${dragY}px) scale(${scale})`,
            borderRadius: borderRadius,
            transition: dragging
              ? "none"
              : "transform 0.3s ease, border-radius 0.3s ease",
          }}
        >
          {/* Tappable background */}
          <div
            style={{ position: "absolute", inset: 0, cursor: "pointer" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {e.photo_url ? (
              <img
                src={`${API}${e.photo_url}`}
                alt=""
                draggable={false}
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
                  background: `linear-gradient(135deg, ${cat.color}22, #000)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 120,
                }}
              >
                {cat.icon}
              </div>
            )}
          </div>

          {/* Left tap indicator */}
          {index > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "30%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 16,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                ‹
              </div>
            </div>
          )}

          {/* Right tap indicator */}
          {index < expenses.length - 1 && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "30%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 16,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                ›
              </div>
            </div>
          )}

          {/* Story progress bars */}
          <div
            style={{
              position: "absolute",
              top: 44,
              left: 16,
              right: 16,
              display: "flex",
              gap: 4,
              pointerEvents: "none",
            }}
          >
            {expenses.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 2,
                  borderRadius: 1,
                  background: i <= index ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          {/* Top bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(rgba(0,0,0,0.65), transparent)",
              padding: "52px 20px 40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pointerEvents: "none",
            }}
          >
            <button
              onClick={onClose}
              onTouchEnd={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                onClose();
              }}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: "8px 14px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                pointerEvents: "all",
              }}
            >
              ✕
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                }}
              >
                {index + 1} / {expenses.length} · {fmt(total)} total
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
              padding: "60px 20px 28px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-1.5px",
                marginBottom: 6,
              }}
            >
              {fmt(e.amount)}
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              {e.store_name}
            </div>
            {e.note && (
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  fontStyle: "italic",
                  marginBottom: 10,
                }}
              >
                "{e.note}"
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: cat.color,
                  background: "rgba(0,0,0,0.5)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontWeight: 600,
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${cat.color}55`,
                }}
              >
                {cat.icon} {e.category}
              </span>
              {isDebt && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#FCD34D",
                    background: "rgba(0,0,0,0.5)",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontWeight: 600,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  🤝 {e.paid_by}
                </span>
              )}
              {e.is_settled && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#34D399",
                    background: "rgba(0,0,0,0.5)",
                    padding: "4px 12px",
                    borderRadius: 20,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  ✓ settled
                </span>
              )}
              {e.entry_type === "scan" && (
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    background: "rgba(0,0,0,0.4)",
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  scanned
                </span>
              )}
            </div>

            {/* Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "all",
              }}
            >
              {/* Dots */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {expenses.map((_, i) => (
                  <div
                    key={i}
                    onTouchEnd={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      setIndex(i);
                    }}
                    style={{
                      width: i === index ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background:
                        i === index
                          ? "linear-gradient(90deg,#F97316,#EC4899)"
                          : "rgba(255,255,255,0.25)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {isDebt && (
                  <button
                    onTouchEnd={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      onSettle(e.id);
                      setToast("Marked as settled");
                    }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSettle(e.id);
                      setToast("Marked as settled");
                    }}
                    style={{
                      background: "rgba(52,211,153,0.15)",
                      border: "1px solid rgba(52,211,153,0.4)",
                      borderRadius: 12,
                      padding: "0 14px",
                      height: 44,
                      color: "#34D399",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    Settled ✓
                  </button>
                )}

                {/* Edit button */}
                <button
                  onTouchEnd={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    setEditing(e);
                  }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setEditing(e);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  onTouchEnd={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    onDelete(e.id);
                    setToast("Deleted");
                  }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDelete(e.id);
                    setToast("Deleted");
                  }}
                  style={{
                    background: "rgba(249,115,22,0.15)",
                    border: "1px solid rgba(249,115,22,0.4)",
                    borderRadius: 12,
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#F97316",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          expense={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            onSaved?.();
            setEditing(null);
          }}
          setToast={setToast}
        />
      )}
    </>
  );
}
