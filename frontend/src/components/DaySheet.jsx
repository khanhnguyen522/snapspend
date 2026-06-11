import { useState } from "react";
import { getCat, fmt } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function DaySheet({
  day,
  expenses,
  month,
  year,
  onClose,
  onSettle,
  onDelete,
  setToast,
}) {
  const [index, setIndex] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [offset, setOffset] = useState(0);

  const label = new Date(year, month, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const e = expenses[index];
  const cat = getCat(e.category);
  const isDebt = e.paid_by && !e.is_settled;
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  const goNext = () => {
    if (index < expenses.length - 1) {
      setIndex((i) => i + 1);
      setOffset(0);
    }
  };
  const goPrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setOffset(0);
    }
  };

  const onTouchStart = (ev) => setDragStart(ev.touches[0].clientX);
  const onTouchMove = (ev) => {
    if (dragStart === null) return;
    setOffset(ev.touches[0].clientX - dragStart);
  };
  const onTouchEnd = () => {
    if (offset < -60) goNext();
    else if (offset > 60) goPrev();
    setOffset(0);
    setDragStart(null);
  };
  const onMouseDown = (ev) => setDragStart(ev.clientX);
  const onMouseMove = (ev) => {
    if (dragStart === null) return;
    setOffset(ev.clientX - dragStart);
  };
  const onMouseUp = () => {
    if (offset < -60) goNext();
    else if (offset > 60) goPrev();
    setOffset(0);
    setDragStart(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          style={{
            transform: `translateX(${offset}px)`,
            transition: dragStart ? "none" : "transform 0.25s ease",
            height: "100%",
          }}
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
          }}
        >
          <button
            onClick={onClose}
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
            }}
          >
            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {expenses.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setIndex(i)}
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
                  onClick={() => {
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
              <button
                onClick={() => {
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
  );
}
