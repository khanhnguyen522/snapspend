import { getCat, fmt } from "../utils";
import { MONTHS } from "../constants";

function GaugeChart({ pct, over, spent, budget }) {
  const clampedPct = Math.min(pct, 100);
  const circumference = Math.PI * 80;
  const dashOffset = circumference - (clampedPct / 100) * circumference;
  const color = over ? "#EF4444" : pct > 80 ? "#FBBF24" : "#F97316";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 28,
      }}
    >
      {/* Gauge */}
      <div style={{ position: "relative", width: 200, height: 115 }}>
        <svg width="200" height="115" viewBox="0 0 200 115">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {over && (
            <span
              style={{
                fontSize: 10,
                color: "#EF4444",
                fontWeight: 700,
                background: "#EF444420",
                padding: "2px 8px",
                borderRadius: 8,
                marginBottom: 4,
              }}
            >
              OVER
            </span>
          )}
          {!over && pct > 80 && (
            <span
              style={{
                fontSize: 10,
                color: "#FBBF24",
                fontWeight: 700,
                background: "#FBBF2420",
                padding: "2px 8px",
                borderRadius: 8,
                marginBottom: 4,
              }}
            >
              ALMOST
            </span>
          )}
          <span
            style={{
              fontSize: 40,
              fontWeight: 800,
              color,
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      {/* Spent / Available row */}
      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "16px 20px 20px",
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#111",
            borderRadius: 12,
            padding: "12px 14px",
            border: "1px solid #1A1A1A",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "#555",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            Spent
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: over ? "#EF4444" : "#fff",
            }}
          >
            {fmt(spent)}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            background: "#111",
            borderRadius: 12,
            padding: "12px 14px",
            border: "1px solid #1A1A1A",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "#555",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            {over ? "Over by" : "Available"}
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: over ? "#EF4444" : "#34D399",
            }}
          >
            {over ? fmt(spent - budget) : fmt(budget - spent)}
          </p>
          <p style={{ fontSize: 11, color: "#333", marginTop: 2 }}>
            of {fmt(budget)}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryBreakdown({ expenses, total, catBudgets }) {
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "other";
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🌱</p>
        <p style={{ fontSize: 14, color: "#333" }}>No expenses this month</p>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorted.map(([cat, amount]) => {
        const config = getCat(cat);
        const pct = total > 0 ? (amount / total) * 100 : 0;
        const budgetRaw = catBudgets[cat];
        const catBudget =
          budgetRaw && budgetRaw !== "" ? parseFloat(budgetRaw) : null;
        const budgetPct = catBudget
          ? Math.min((amount / catBudget) * 100, 100)
          : null;
        const over = catBudget && amount > catBudget;

        return (
          <div
            key={cat}
            style={{
              background: "#0A0A0A",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1px solid #1A1A1A",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: catBudget ? 10 : 0,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${config.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </div>

              {/* Name + subtitle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {cat}
                </p>
                {catBudget && (
                  <p
                    style={{
                      fontSize: 11,
                      color: over ? "#EF444488" : "#34D39988",
                      marginTop: 1,
                    }}
                  >
                    {over
                      ? `${fmt(amount - catBudget)} over`
                      : `${fmt(catBudget - amount)} left`}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: over ? "#EF4444" : "#fff",
                  }}
                >
                  {fmt(amount)}
                </p>
                <p style={{ fontSize: 11, color: "#444", marginTop: 1 }}>
                  {catBudget ? `/ ${fmt(catBudget)}` : `${Math.round(pct)}%`}
                </p>
              </div>
            </div>

            {/* Progress bar — only show if has budget or spending */}
            {catBudget && (
              <div
                style={{
                  height: 4,
                  background: "#1A1A1A",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    width: `${budgetPct}%`,
                    background: over
                      ? "#EF4444"
                      : budgetPct > 80
                        ? "#FBBF24"
                        : config.color,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OverviewPage({
  expenses,
  total,
  budget,
  catBudgets,
  insights,
  loadingInsights,
  onRefresh,
  month,
  year,
  onMonthChange,
}) {
  const budgetPct = budget > 0 ? (total / budget) * 100 : 0;
  const over = total > budget;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 16px",
          flexShrink: 0,
          borderBottom: "1px solid #111",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
            Overview
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => onMonthChange(-1)}
              style={{
                background: "none",
                border: "none",
                color: "#555",
                fontSize: 22,
                cursor: "pointer",
                padding: "0 6px",
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontSize: 13,
                color: "#888",
                minWidth: 90,
                textAlign: "center",
              }}
            >
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={() => onMonthChange(1)}
              style={{
                background: "none",
                border: "none",
                color: "#555",
                fontSize: 22,
                cursor: "pointer",
                padding: "0 6px",
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px" }}>
        {/* Gauge card */}
        <div
          style={{
            background: "#0A0A0A",
            borderRadius: 20,
            margin: "16px 0 20px",
            border: "1px solid #1A1A1A",
            overflow: "hidden",
          }}
        >
          <GaugeChart
            pct={budgetPct}
            over={over}
            spent={total}
            budget={budget}
          />
          <div
            style={{ padding: "10px 20px 14px", borderTop: "1px solid #111" }}
          >
            <p style={{ fontSize: 12, color: "#333" }}>
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} this
              month
            </p>
          </div>
        </div>

        {/* Category section */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          Spending
        </p>
        <CategoryBreakdown
          expenses={expenses}
          total={total}
          catBudgets={catBudgets || {}}
        />

        {/* AI Insights */}
        <div
          style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #111" }}
        >
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
                letterSpacing: "0.08em",
              }}
            >
              AI Insights
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
