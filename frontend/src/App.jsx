import { useState, useEffect } from "react";
import axios from "axios";
import { MONTHS, DAYS } from "./constants";
import { fmt } from "./utils";
import { appStyles as s } from "./styles/app";
import { calendarStyles as cal } from "./styles/calendar";
import AddModal from "./components/AddModal";
import BudgetModal from "./components/BudgetModal";
import DayCell from "./components/DayCell";
import DaySheet from "./components/DaySheet";
import Toast from "./components/Toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(500);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [daySheet, setDaySheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [expRes, budRes] = await Promise.all([
        axios.get(`${API}/expenses`),
        axios.get(`${API}/budget`),
      ]);
      setExpenses(expRes.data);
      setBudget(parseFloat(budRes.data.budget));
    } catch {}
  };

  const settle = async (id) => {
    await axios.patch(`${API}/expenses/${id}/settle`);
    fetchAll();
    if (daySheet) {
      setDaySheet((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === id ? { ...e, is_settled: true } : e,
        ),
      }));
    }
  };

  const deleteExp = async (id) => {
    await axios.delete(`${API}/expenses/${id}`);
    fetchAll();
    if (daySheet) {
      const remaining = daySheet.expenses.filter((e) => e.id !== id);
      if (remaining.length === 0) setDaySheet(null);
      else setDaySheet({ ...daySheet, expenses: remaining });
    }
  };

  const getInsights = async () => {
    setLoadingInsights(true);
    setShowInsights(true);
    try {
      const res = await axios.get(`${API}/insights`);
      setInsights(res.data.insights);
    } catch {}
    setLoadingInsights(false);
  };

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthExpenses = expenses.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const byDay = monthExpenses.reduce((acc, e) => {
    const d = new Date(e.date).getDate();
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const totalSpent = monthExpenses.reduce(
    (s, e) => s + parseFloat(e.amount),
    0,
  );
  const budgetPct = Math.min((totalSpent / budget) * 100, 100);
  const over = totalSpent > budget;
  const debts = expenses.filter((e) => e.paid_by && !e.is_settled);
  const totalOwed = debts.reduce((s, e) => s + parseFloat(e.amount), 0);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F172A; font-family: 'Inter', sans-serif; }
        input, select, button { font-family: 'Inter', sans-serif; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeUp { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        select { appearance: none; }
      `}</style>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.logo}>Snapspend</h1>
            <p style={s.sub}>
              {MONTHS[month]} {year}
            </p>
          </div>
          <button onClick={() => setShowBudget(true)} style={s.budgetChip}>
            <span style={{ fontSize: 11, color: "#475569" }}>Budget</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: over ? "#F87171" : "#60A5FA",
              }}
            >
              {fmt(budget)}
            </span>
          </button>
        </div>

        {/* Budget bar */}
        <div style={s.budgetBar}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#475569" }}>
              {over
                ? `Over by ${fmt(totalSpent - budget)}`
                : `${fmt(budget - totalSpent)} left`}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: over ? "#F87171" : "#F1F5F9",
              }}
            >
              {fmt(totalSpent)}{" "}
              <span style={{ color: "#334155", fontWeight: 400 }}>
                / {fmt(budget)}
              </span>
            </span>
          </div>
          <div style={s.track}>
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                width: `${budgetPct}%`,
                background: over
                  ? "linear-gradient(90deg,#EF4444,#B91C1C)"
                  : budgetPct > 80
                    ? "linear-gradient(90deg,#F59E0B,#D97706)"
                    : "linear-gradient(90deg,#3B82F6,#1D4ED8)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Debt banner */}
        {debts.length > 0 && (
          <div style={s.debtBanner}>
            <span style={{ fontSize: 14 }}>🤝</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#FCD34D" }}>
                You owe {fmt(totalOwed)}
              </span>
              <span style={{ fontSize: 12, color: "#92400E", marginLeft: 6 }}>
                across {debts.length} expense{debts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Month nav */}
        <div style={s.monthNav}>
          <button onClick={prevMonth} style={s.navBtn}>
            ‹
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#CBD5E1" }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={s.navBtn}>
            ›
          </button>
        </div>

        {/* Calendar */}
        <div style={cal.grid}>
          {DAYS.map((d) => (
            <div key={d} style={cal.dayLabel}>
              {d}
            </div>
          ))}
          {cells.map((day, i) => (
            <DayCell
              key={i}
              day={day}
              expenses={day ? byDay[day] || [] : []}
              onClick={(d, exps) => setDaySheet({ day: d, expenses: exps })}
            />
          ))}
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={s.statVal}>{monthExpenses.length}</span>
            <span style={s.statLbl}>expenses</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={s.statVal}>{fmt(totalSpent)}</span>
            <span style={s.statLbl}>spent</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={{ ...s.statVal, color: "#F59E0B" }}>
              {fmt(totalOwed)}
            </span>
            <span style={s.statLbl}>owed</span>
          </div>
          <div style={s.statDivider} />
          <button onClick={getInsights} style={s.insightBtn}>
            {loadingInsights ? "..." : "✦ AI"}
          </button>
        </div>

        {/* Insights */}
        {showInsights && (
          <div style={s.insightsCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Spending insights
              </span>
              <button
                onClick={() => setShowInsights(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
            {loadingInsights ? (
              <p style={{ fontSize: 13, color: "#475569" }}>Analyzing...</p>
            ) : (
              insights
                .split("\n")
                .filter((l) => l.trim())
                .map((l, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "#94A3B8",
                      lineHeight: 1.6,
                      marginBottom: 6,
                    }}
                  >
                    {l.replace(/\*\*/g, "")}
                  </p>
                ))
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowAdd(true)} style={s.fab}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Modals */}
      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSaved={fetchAll}
          setToast={setToast}
        />
      )}
      {showBudget && (
        <BudgetModal
          current={budget}
          onClose={() => setShowBudget(false)}
          onSaved={fetchAll}
          setToast={setToast}
        />
      )}
      {daySheet && (
        <DaySheet
          day={daySheet.day}
          expenses={daySheet.expenses}
          month={month}
          year={year}
          onClose={() => setDaySheet(null)}
          onSettle={settle}
          onDelete={deleteExp}
          setToast={setToast}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
