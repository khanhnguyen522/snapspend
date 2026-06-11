import { useState, useEffect, useRef } from "react";
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
  const galleryRef = useRef();
  const [galleryFile, setGalleryFile] = useState(null);
  const monthStripRef = useRef();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (monthStripRef.current) {
      const active = monthStripRef.current.querySelector(
        "[data-active='true']",
      );
      if (active)
        active.scrollIntoView({
          inline: "center",
          behavior: "smooth",
          block: "nearest",
        });
    }
  }, [month]);

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

  const getMonthRingStyle = (i) => {
    const isActive = i === month;
    const hasExp = expenses.some((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === i && d.getFullYear() === year;
    });
    if (isActive) return s.monthRingActive;
    if (hasExp) return s.monthRingHasExp;
    return s.monthRingInactive;
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; font-family: 'Inter', sans-serif; }
        input, select, button { font-family: 'Inter', sans-serif; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeUp { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        select { appearance: none; }
        .month-strip::-webkit-scrollbar { display: none; }
        .month-strip { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.logo}>snapspend</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#555" }}>{year}</span>
            <button
              onClick={() => setShowBudget(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div style={s.avatar}>
                <div style={s.avatarInner}>S</div>
              </div>
            </button>
          </div>
        </div>

        {/* Month strip */}
        <div ref={monthStripRef} className="month-strip" style={s.monthStrip}>
          {MONTHS.map((m, i) => {
            const isActive = i === month;
            const ringStyle = getMonthRingStyle(i);
            return (
              <div
                key={m}
                data-active={isActive}
                style={s.monthItem}
                onClick={() => setMonth(i)}
              >
                <div style={ringStyle}>
                  <div
                    style={
                      isActive || ringStyle === s.monthRingHasExp
                        ? s.monthInnerActive
                        : s.monthInnerInactive
                    }
                  >
                    {m.slice(0, 3)}
                  </div>
                </div>
              </div>
            );
          })}
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
          <div style={s.stat}>
            <span style={{ ...s.statVal, color: "#F97316" }}>
              {fmt(totalSpent)}
            </span>
            <span style={s.statLbl}>spent</span>
          </div>
          <div style={s.stat}>
            <span
              style={{
                ...s.statVal,
                color: totalOwed > 0 ? "#EC4899" : "#fff",
              }}
            >
              {fmt(totalOwed)}
            </span>
            <span style={s.statLbl}>owed</span>
          </div>
          <div style={s.stat}>
            <span
              style={{
                ...s.statVal,
                color: over
                  ? "#F87171"
                  : budgetPct > 80
                    ? "#FBBF24"
                    : "#8B5CF6",
              }}
            >
              {Math.round(budgetPct)}%
            </span>
            <span style={s.statLbl}>budget</span>
          </div>
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
                  color: "#444",
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
                  color: "#444",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
            {loadingInsights ? (
              <p style={{ fontSize: 13, color: "#444" }}>Analyzing...</p>
            ) : (
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

      {/* Bottom tab bar */}
      <div style={s.bottomBar}>
        {/* Gallery picker */}
        <button style={s.tabBtn} onClick={() => galleryRef.current?.click()}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              setGalleryFile(e.target.files[0]);
              setShowAdd(true);
            }
          }}
        />

        {/* Center camera FAB */}
        <button style={s.fabBtn} onClick={() => setShowAdd(true)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* AI insights */}
        <button
          style={s.tabBtn}
          onClick={() => {
            setShowInsights(!showInsights);
            if (!insights) getInsights();
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={showInsights ? "#F97316" : "#444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          {showInsights && (
            <div style={{ ...s.tabDot, background: "#F97316" }} />
          )}
        </button>
      </div>

      {showAdd && (
        <AddModal
          onClose={() => {
            setShowAdd(false);
            setGalleryFile(null);
          }}
          onSaved={fetchAll}
          setToast={setToast}
          initialFile={galleryFile}
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
