import { calendarStyles as cal } from "../styles/calendar";
import { getCat, fmt } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getRingGradient = (count) => {
  if (count >= 3) return "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)";
  if (count === 2) return "linear-gradient(135deg,#8B5CF6,#6D28D9)";
  return "linear-gradient(135deg,#F97316,#EC4899)";
};

export default function DayCell({ day, expenses, onClick }) {
  if (!day) return <div />;

  const hasExpenses = expenses.length > 0;
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const count = expenses.length;
  const hasDebt = expenses.some((e) => e.paid_by && !e.is_settled);
  const photos = expenses.filter((e) => e.photo_url);
  const stackCount = Math.min(count, 3);

  const stackOffsets = [
    { rotate: "5deg", top: 5, left: 5, zIndex: 1, opacity: 0.6 },
    { rotate: "2deg", top: 3, left: 3, zIndex: 2, opacity: 0.8 },
    { rotate: "0deg", top: 0, left: 0, zIndex: 3, opacity: 1 },
  ].slice(3 - stackCount);

  if (!hasExpenses) {
    return (
      <div style={{ ...cal.cell, cursor: "default" }}>
        <span
          style={{
            position: "absolute",
            top: 4,
            left: 5,
            fontSize: 10,
            color: "#222",
            fontWeight: 600,
          }}
        >
          {day}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(day, expenses)}
      style={{
        borderRadius: 9,
        minHeight: 56,
        position: "relative",
        background: getRingGradient(count),
        padding: 1.5,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          background: "#000",
          borderRadius: 8,
          height: "100%",
          minHeight: 53,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Stacked photos/cards */}
        {stackOffsets.map((offset, i) => {
          const expIdx = expenses.length - stackCount + i;
          const exp = expenses[Math.max(0, expIdx)];
          const cat = getCat(exp?.category);
          const isTop = i === stackOffsets.length - 1;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: offset.top,
                left: offset.left,
                right: -offset.left,
                bottom: -offset.top,
                borderRadius: 7,
                overflow: "hidden",
                transform: `rotate(${offset.rotate})`,
                zIndex: offset.zIndex,
                opacity: offset.opacity,
              }}
            >
              {exp?.photo_url ? (
                <img
                  src={`${API}${exp.photo_url}`}
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
                    background: cat.color + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {cat.icon}
                </div>
              )}

              {isTop && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(transparent 35%, rgba(0,0,0,0.8))",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Day number */}
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 4,
            zIndex: 10,
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {day}
        </div>

        {/* Count badge */}
        {count > 1 && (
          <div
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              zIndex: 10,
              background: "rgba(236,72,153,0.85)",
              borderRadius: 4,
              padding: "1px 3px",
              fontSize: 7,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {count}
          </div>
        )}

        {/* Amount */}
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: 4,
            zIndex: 10,
            fontSize: 9,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {fmt(total)}
        </div>

        {/* Debt dot */}
        {hasDebt && (
          <div
            style={{
              position: "absolute",
              bottom: 3,
              right: 4,
              zIndex: 10,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#FBBF24",
            }}
          />
        )}
      </div>
    </div>
  );
}
