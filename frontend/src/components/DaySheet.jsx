import { modalStyles as m } from "../styles/modal";
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
  const label = new Date(year, month, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div
      style={m.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...m.sheet, maxHeight: "80vh" }}>
        <div style={m.handle} />
        <div style={m.sheetHeader}>
          <button onClick={onClose} style={m.backBtn}>
            Done
          </button>
          <span style={m.sheetTitle2}>{label}</span>
          <span
            style={{
              fontSize: 13,
              color: "#60A5FA",
              fontWeight: 600,
              minWidth: 60,
              textAlign: "right",
            }}
          >
            {fmt(total)}
          </span>
        </div>

        <div
          style={{
            overflowY: "auto",
            maxHeight: "65vh",
            padding: "8px 20px 32px",
          }}
        >
          {expenses.map((e) => {
            const cat = getCat(e.category);
            const isDebt = e.paid_by && !e.is_settled;
            return (
              <div key={e.id} style={m.daySheetRow}>
                {e.photo_url ? (
                  <img
                    src={`${API}${e.photo_url}`}
                    alt=""
                    style={m.daySheetPhoto}
                  />
                ) : (
                  <div
                    style={{
                      ...m.daySheetIconBox,
                      background: cat.color + "22",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#F1F5F9",
                      marginBottom: 2,
                    }}
                  >
                    {e.store_name}
                  </div>
                  {e.note && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        marginBottom: 3,
                        fontStyle: "italic",
                      }}
                    >
                      {e.note}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: cat.color,
                        background: cat.color + "18",
                        padding: "2px 7px",
                        borderRadius: 5,
                        fontWeight: 500,
                      }}
                    >
                      {cat.icon} {e.category}
                    </span>
                    {isDebt && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#F59E0B",
                          background: "#78350F22",
                          padding: "2px 7px",
                          borderRadius: 5,
                          fontWeight: 500,
                        }}
                      >
                        🤝 {e.paid_by}
                      </span>
                    )}
                    {e.is_settled && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#34D399",
                          background: "#064E3B22",
                          padding: "2px 7px",
                          borderRadius: 5,
                        }}
                      >
                        ✓ settled
                      </span>
                    )}
                    {e.entry_type === "scan" && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#475569",
                          background: "#1E293B",
                          padding: "1px 6px",
                          borderRadius: 4,
                        }}
                      >
                        scanned
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}
                  >
                    {fmt(e.amount)}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {isDebt && (
                      <button
                        onClick={() => {
                          onSettle(e.id);
                          setToast("Marked as settled");
                        }}
                        style={m.settleBtn}
                      >
                        Settled ✓
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDelete(e.id);
                        setToast("Deleted");
                      }}
                      style={m.deleteBtn}
                    >
                      <svg
                        width="13"
                        height="13"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
