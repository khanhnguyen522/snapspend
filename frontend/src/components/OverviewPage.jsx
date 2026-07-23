import { useState } from "react";
import { getCat, fmt } from "../utils";
import { MONTHS, CATEGORIES } from "../constants";

function GaugeChart({ pct, over, spent, budget }) {
  const clampedPct = Math.min(pct, 100);
  const circumference = Math.PI * 90;
  const dashOffset = circumference - (clampedPct / 100) * circumference;
  const color = over ? "#EF4444" : pct > 80 ? "#FBBF24" : "#F97316";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 20px 0",
      }}
    >
      <div style={{ position: "relative", width: 220, height: 125 }}>
        <svg width="220" height="125" viewBox="0 0 220 125">
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {budget === 0 ? (
            <span style={{ fontSize: 13, color: "#444" }}>No budgets set</span>
          ) : (
            <>
              {over && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#EF4444",
                    fontWeight: 700,
                    background: "#EF444420",
                    padding: "2px 10px",
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  OVER BUDGET
                </span>
              )}
              {!over && pct > 80 && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#FBBF24",
                    fontWeight: 700,
                    background: "#FBBF2420",
                    padding: "2px 10px",
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  ALMOST THERE
                </span>
              )}
              {!over && pct <= 80 && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#34D399",
                    fontWeight: 700,
                    background: "#34D39920",
                    padding: "2px 10px",
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  ON TRACK
                </span>
              )}
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                }}
              >
                {Math.round(pct)}%
              </span>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "20px 4px 20px",
        }}
      >
        <div>
          <p style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>Spent</p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: over ? "#EF4444" : "#fff",
            }}
          >
            {fmt(spent)}
          </p>
        </div>
        {budget > 0 && (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>
              {over ? "Over by" : "Available"}
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: over ? "#EF4444" : "#34D399",
              }}
            >
              {over ? fmt(spent - budget) : fmt(budget - spent)}
            </p>
            <p style={{ fontSize: 11, color: "#333" }}>/ {fmt(budget)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddBucketModal({ catBudgets, onSave, onClose }) {
  const [selectedCat, setSelectedCat] = useState("");
  const [amount, setAmount] = useState("");

  const available = CATEGORIES.filter(
    (c) => !catBudgets[c] || catBudgets[c] === "",
  );

  const save = () => {
    if (!selectedCat || !amount || isNaN(parseFloat(amount))) return;
    onSave(selectedCat, amount);
    onClose();
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
        fontFamily: "Inter, sans-serif",
        animation: "slideUp 0.25s ease",
        touchAction: "none",
      }}
    >
      {/* Header */}
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
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cancel
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
          New bucket
        </span>
        <button
          onClick={save}
          style={{
            background: "none",
            border: "none",
            color: "#F97316",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Add
        </button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px 48px",
          touchAction: "pan-y",
        }}
      >
        {/* Amount first */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Monthly limit
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: "1px solid #111",
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 300, color: "#333" }}>
            $
          </span>
          <input
            type="number"
            placeholder="0"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              flex: 1,
              fontSize: 38,
              fontWeight: 700,
              color: "#fff",
              border: "none",
              outline: "none",
              background: "none",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>

        {/* Category picker */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Category
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {available.map((cat) => {
            const config = getCat(cat);
            const selected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  background: selected ? `${config.color}20` : "#0A0A0A",
                  border: `1.5px solid ${selected ? config.color : "#1A1A1A"}`,
                  borderRadius: 12,
                  padding: "14px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 26 }}>{config.icon}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: selected ? "#fff" : "#555",
                    textTransform: "capitalize",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div
        style={{
          padding: "12px 20px 36px",
          borderTop: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <button
          onClick={save}
          disabled={!selectedCat || !amount}
          style={{
            width: "100%",
            padding: "16px",
            background:
              selectedCat && amount
                ? "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)"
                : "#111",
            border: "none",
            borderRadius: 14,
            color: selectedCat && amount ? "#fff" : "#333",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.2s",
          }}
        >
          {selectedCat ? `Add ${selectedCat} bucket` : "Select a category"}
        </button>
      </div>
    </div>
  );
}

function BucketCard({ cat, amount, catBudgets, onEdit, onDelete }) {
  const config = getCat(cat);
  const catBudget = parseFloat(catBudgets[cat]);
  const budgetPct = Math.min((amount / catBudget) * 100, 100);
  const over = amount > catBudget;
  const remaining = catBudget - amount;

  return (
    <div
      style={{
        background: "#0A0A0A",
        borderRadius: 16,
        padding: "16px",
        border: "1px solid #1A1A1A",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: `${config.color}25`,
            border: `1.5px solid ${config.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {config.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 15,
              color: "#fff",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {cat}
          </p>
          <p style={{ fontSize: 12, marginTop: 2 }}>
            {over ? (
              <span style={{ color: "#EF444488" }}>
                {fmt(Math.abs(remaining))} over
              </span>
            ) : (
              <span style={{ color: "#34D39988" }}>
                {fmt(remaining)} remaining
              </span>
            )}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: over ? "#EF4444" : "#fff",
            }}
          >
            {fmt(amount)}
          </p>
          <p style={{ fontSize: 11, color: "#333", marginTop: 2 }}>
            / {fmt(catBudget)}
          </p>
        </div>
        <button
          onClick={() => onDelete(cat)}
          style={{
            background: "none",
            border: "none",
            color: "#333",
            cursor: "pointer",
            fontSize: 18,
            padding: "0 0 0 8px",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          marginTop: 12,
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
            transition: "width 0.6s ease",
          }}
        />
      </div>
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
  onSaveBudgets,
  setToast,
}) {
  const [showAddBucket, setShowAddBucket] = useState(false);
  const budgetPct = budget > 0 ? (total / budget) * 100 : 0;
  const over = total > budget;

  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "other";
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const buckets = Object.entries(catBudgets || {})
    .filter(([, val]) => val && val !== "")
    .sort((a, b) => {
      const pctA = (byCategory[a[0]] || 0) / parseFloat(a[1]);
      const pctB = (byCategory[b[0]] || 0) / parseFloat(b[1]);
      return pctB - pctA;
    });

  const handleAddBucket = (cat, amount) => {
    const newBudgets = { ...catBudgets, [cat]: amount };
    onSaveBudgets(newBudgets);
    setToast("Bucket added");
  };

  const handleDeleteBucket = (cat) => {
    const newBudgets = { ...catBudgets };
    delete newBudgets[cat];
    onSaveBudgets(newBudgets);
    setToast("Bucket removed");
  };

  const availableToAdd = CATEGORIES.filter(
    (c) => !catBudgets[c] || catBudgets[c] === "",
  );

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
          padding: "52px 20px 14px",
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
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button
              onClick={() => onMonthChange(-1)}
              style={{
                background: "none",
                border: "none",
                color: "#444",
                fontSize: 22,
                cursor: "pointer",
                padding: "0 8px",
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontSize: 13,
                color: "#666",
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
                color: "#444",
                fontSize: 22,
                cursor: "pointer",
                padding: "0 8px",
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px" }}>
        {/* Gauge */}
        <div
          style={{
            background: "#0A0A0A",
            borderRadius: 20,
            margin: "16px 0 8px",
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
            style={{ padding: "8px 20px 14px", borderTop: "1px solid #111" }}
          >
            <p style={{ fontSize: 12, color: "#333" }}>
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} this
              month
            </p>
          </div>
        </div>

        {/* Buckets header */}
        <div
          style={{
            marginTop: 20,
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            Budgets
          </p>
          {availableToAdd.length > 0 && (
            <button
              onClick={() => setShowAddBucket(true)}
              style={{
                background: "linear-gradient(135deg,#F97316,#EC4899)",
                border: "none",
                borderRadius: 20,
                padding: "5px 14px",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              + Add bucket
            </button>
          )}
        </div>

        {/* Bucket list */}
        {buckets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#0A0A0A",
              borderRadius: 16,
              border: "1px solid #1A1A1A",
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 12 }}>💰</p>
            <p
              style={{
                fontSize: 15,
                color: "#fff",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              No budgets yet
            </p>
            <p style={{ fontSize: 13, color: "#333", marginBottom: 20 }}>
              Add a bucket to start tracking your spending by category
            </p>
            <button
              onClick={() => setShowAddBucket(true)}
              style={{
                background: "linear-gradient(135deg,#F97316,#EC4899)",
                border: "none",
                borderRadius: 12,
                padding: "12px 24px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              + Add your first bucket
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {buckets.map(([cat]) => (
              <BucketCard
                key={cat}
                cat={cat}
                amount={byCategory[cat] || 0}
                catBudgets={catBudgets}
                onDelete={handleDeleteBucket}
              />
            ))}
          </div>
        )}

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

      {showAddBucket && (
        <AddBucketModal
          catBudgets={catBudgets}
          onSave={handleAddBucket}
          onClose={() => setShowAddBucket(false)}
        />
      )}
    </div>
  );
}
