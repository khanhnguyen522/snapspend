import { useEffect } from "react";
import { getCat, fmt } from "../utils";

function CategoryBreakdown({ expenses, total, catBudgets }) {
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "other";
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0)
    return (
      <p
        style={{
          fontSize: 13,
          color: "#444",
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        No expenses this month.
      </p>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sorted.map(([cat, amount]) => {
        const config = getCat(cat);
        const pct = total > 0 ? (amount / total) * 100 : 0;
        const budgetRaw = catBudgets[cat];
        const budget =
          budgetRaw && budgetRaw !== "" ? parseFloat(budgetRaw) : null;
        const budgetPct = budget
          ? Math.min((amount / budget) * 100, 100)
          : null;
        const over = budget && amount > budget;

        return (
          <div key={cat}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{config.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#ccc",
                    textTransform: "capitalize",
                  }}
                >
                  {cat}
                </span>
                {over && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#F87171",
                      background: "#7F1D1D33",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    over
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: over ? "#F87171" : "#fff",
                  }}
                >
                  {fmt(amount)}
                </span>
                {budget ? (
                  <span style={{ fontSize: 11, color: "#444", marginLeft: 4 }}>
                    / {fmt(budget)}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: "#444", marginLeft: 6 }}>
                    {Math.round(pct)}%
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                height: 4,
                background: "#111",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${budget ? budgetPct : pct}%`,
                  background: over
                    ? "#EF4444"
                    : budget && budgetPct > 80
                      ? "#FBBF24"
                      : config.color,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPanel({
  expenses,
  total,
  catBudgets,
  insights,
  loadingInsights,
  onRefresh,
  onClose,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.98)",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.25s ease",
      }}
    >
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: none; } }`}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "52px 20px 16px",
          borderBottom: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Stats</h2>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 20,
            padding: "8px 14px",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px" }}>
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 16,
            }}
          >
            Spending by category
          </p>
          <CategoryBreakdown
            expenses={expenses}
            total={total}
            catBudgets={catBudgets || {}}
          />
        </div>

        <div style={{ borderTop: "1px solid #111", paddingTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              AI insights
            </p>
            {insights && !loadingInsights && (
              <button
                onClick={onRefresh}
                style={{
                  background: "none",
                  border: "none",
                  color: "#F97316",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ↻ Refresh
              </button>
            )}
          </div>

          {!insights && !loadingInsights && (
            <button
              onClick={onRefresh}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              ✦ Analyze my spending
            </button>
          )}

          {loadingInsights && (
            <p style={{ fontSize: 13, color: "#444" }}>
              Analyzing your spending...
            </p>
          )}

          {insights &&
            !loadingInsights &&
            insights
              .split("\n")
              .filter((l) => l.trim())
              .map((l, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.6,
                    marginBottom: 8,
                  }}
                >
                  {l.replace(/\*\*/g, "")}
                </p>
              ))}
        </div>
      </div>
    </div>
  );
}
