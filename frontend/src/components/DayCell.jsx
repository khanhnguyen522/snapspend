import { calendarStyles as cal } from "../styles/calendar";
import { getCat, fmt } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function DayCell({ day, expenses, onClick }) {
  if (!day) return <div />;

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const photos = expenses.filter((e) => e.photo_url).slice(0, 2);
  const hasDebt = expenses.some((e) => e.paid_by && !e.is_settled);

  return (
    <div
      onClick={() => expenses.length > 0 && onClick(day, expenses)}
      style={{
        ...cal.cell,
        cursor: expenses.length > 0 ? "pointer" : "default",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: expenses.length ? "#94A3B8" : "#334155",
          fontWeight: 500,
        }}
      >
        {day}
      </span>

      {photos.length > 0 ? (
        <div
          style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap" }}
        >
          {photos.map((e, i) => (
            <img
              key={i}
              src={`${API}${e.photo_url}`}
              alt=""
              style={cal.thumb}
            />
          ))}
          {expenses.length > 2 && (
            <div style={cal.moreChip}>+{expenses.length - 2}</div>
          )}
        </div>
      ) : expenses.length > 0 ? (
        <div
          style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap" }}
        >
          {expenses.slice(0, 3).map((e, i) => (
            <div
              key={i}
              style={{
                ...cal.iconChip,
                background: getCat(e.category).color + "22",
                color: getCat(e.category).color,
              }}
            >
              {getCat(e.category).icon}
            </div>
          ))}
        </div>
      ) : null}

      {total > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            marginTop: 2,
          }}
        >
          <span style={{ fontSize: 10, color: "#60A5FA", fontWeight: 600 }}>
            {fmt(total)}
          </span>
          {hasDebt && <span style={{ fontSize: 9, color: "#F59E0B" }}>●</span>}
        </div>
      )}
    </div>
  );
}
