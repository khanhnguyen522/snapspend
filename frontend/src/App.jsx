import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MONTHS, DAYS } from "./constants";
import { appStyles as s } from "./styles/app";
import { calendarStyles as cal } from "./styles/calendar";
import AddModal from "./components/AddModal";
import DayCell from "./components/DayCell";
import DaySheet from "./components/DaySheet";
import OverviewPage from "./components/OverviewPage";
import SearchModal from "./components/SearchModal";
import AuthScreen from "./components/AuthScreen";
import Toast from "./components/Toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const NOW_MONTH = new Date().getMonth();
const NOW_YEAR = new Date().getFullYear();

const token = localStorage.getItem("token");
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(NOW_MONTH);
  const [year, setYear] = useState(NOW_YEAR);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showAdd, setShowAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [daySheet, setDaySheet] = useState(null);
  const [toast, setToast] = useState(null);
  const galleryRef = useRef();
  const [galleryFile, setGalleryFile] = useState(null);
  const monthStripRef = useRef();

  useEffect(() => {
    if (user) fetchAll();
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

  useEffect(() => {
    const anyOpen = showAdd || showSearch || !!daySheet;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAdd, showSearch, daySheet]);

  const fetchAll = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        axios.get(`${API}/expenses`),
        axios.get(`${API}/categories`),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data.categories || []);
    } catch {}
  };

  const addCategory = async (cat) => {
    try {
      const res = await axios.post(`${API}/categories`, cat);
      setCategories((prev) => [...prev, res.data.category]);
    } catch {}
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API}/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      if (err.response?.status === 409) {
        const e = new Error(err.response.data.message);
        e.needsReassign = true;
        throw e;
      }
      throw new Error("Failed to delete bucket.");
    }
  };

  const reassignAndDeleteCategory = async (id, targetId) => {
    try {
      await axios.post(`${API}/categories/${id}/reassign-and-delete`, {
        targetId,
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      fetchAll(); // refresh expenses since their category changed
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Failed to reassign and delete.",
      );
    }
  };

  const handleLogin = (u) => {
    const t = localStorage.getItem("token");
    if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setUser(u);
    fetchAll();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setExpenses([]);
    setCategories([]);
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

  const handleSelectDay = (day, month, year) => {
    setMonth(month);
    setYear(year);
    const dayExpenses = expenses.filter((e) => {
      if (!e.date) return false;
      const [y, m, d] = e.date.split("T")[0].split("-").map(Number);
      return d === day && m - 1 === month && y === year;
    });
    setDaySheet({ day, expenses: dayExpenses });
  };

  const handleOverviewMonthChange = (dir) => {
    if (dir === 1) {
      if (month === 11) {
        setMonth(0);
        setYear((y) => y + 1);
      } else setMonth((m) => m + 1);
    } else {
      if (month === 0) {
        setMonth(11);
        setYear((y) => y - 1);
      } else setMonth((m) => m - 1);
    }
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthExpenses = expenses.filter((e) => {
    if (!e.date) return false;
    const [y, m] = e.date.split("T")[0].split("-").map(Number);
    return m - 1 === month && y === year;
  });

  const byDay = monthExpenses.reduce((acc, e) => {
    const d = parseInt(e.date.split("T")[0].split("-")[2]);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const totalSpent = monthExpenses.reduce(
    (s, e) => s + parseFloat(e.amount),
    0,
  );
  const totalBudget = categories.reduce(
    (s, c) => s + parseFloat(c.budget || 0),
    0,
  );

  const getMonthRingStyle = (i) => {
    const isActive = i === month;
    const hasExp = expenses.some((e) => {
      if (!e.date) return false;
      const [y, m] = e.date.split("T")[0].split("-").map(Number);
      return m - 1 === i && y === year;
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

      {activeTab === "calendar" && (
        <div style={s.container}>
          <div style={s.header}>
            <div>
              <h1 style={s.logo}>snapspend</h1>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  marginTop: 3,
                  fontWeight: 500,
                }}
              >
                Hi, {user?.name}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setShowSearch(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setYear((y) => y - 1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#555",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>
                <span style={{ fontSize: 13, color: "#555" }}>{year}</span>
                <button
                  onClick={() => setYear((y) => y + 1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#555",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <div style={s.avatar}>
                    <div style={s.avatarInner}>
                      {user?.name?.[0]?.toUpperCase() || "S"}
                    </div>
                  </div>
                </button>
                {showProfileMenu && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 199 }}
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 40,
                        right: 0,
                        zIndex: 200,
                        background: "#111",
                        border: "1px solid #1A1A1A",
                        borderRadius: 12,
                        padding: 8,
                        minWidth: 170,
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 12px 10px",
                          borderBottom: "1px solid #1A1A1A",
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {user.name}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#444", marginTop: 2 }}
                        >
                          {user.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        style={{
                          width: "100%",
                          background: "none",
                          border: "none",
                          color: "#F87171",
                          fontSize: 13,
                          padding: "10px 12px",
                          textAlign: "left",
                          cursor: "pointer",
                          borderRadius: 8,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div ref={monthStripRef} className="month-strip" style={s.monthStrip}>
            {MONTHS.map((m, i) => {
              const isActive = i === month;
              const isToday = i === NOW_MONTH && year === NOW_YEAR;
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
                  {isToday && (
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: isActive ? "#F97316" : "#555",
                        marginTop: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

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
                isToday={
                  day === new Date().getDate() &&
                  month === NOW_MONTH &&
                  year === NOW_YEAR
                }
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <OverviewPage
          expenses={monthExpenses}
          total={totalSpent}
          budget={totalBudget}
          categories={categories}
          month={month}
          year={year}
          onMonthChange={handleOverviewMonthChange}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onReassignAndDelete={reassignAndDeleteCategory}
          setToast={setToast}
        />
      )}

      <div style={s.bottomBar}>
        <button style={s.tabBtn} onClick={() => setActiveTab("calendar")}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={activeTab === "calendar" ? "#F97316" : "#444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {activeTab === "calendar" && (
            <div style={{ ...s.tabDot, background: "#F97316" }} />
          )}
        </button>

        <>
          <button
            style={s.fabBtn}
            onClick={() => {
              setGalleryFile(null);
              setShowAdd(true);
            }}
          >
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
        </>

        <button style={s.tabBtn} onClick={() => setActiveTab("overview")}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={activeTab === "overview" ? "#F97316" : "#444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          {activeTab === "overview" && (
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
          categories={categories}
          onAddCategory={addCategory}
          monthExpenses={monthExpenses}
        />
      )}
      {showSearch && (
        <SearchModal
          expenses={expenses}
          onClose={() => setShowSearch(false)}
          onSelectDay={handleSelectDay}
          categories={categories}
        />
      )}
      {daySheet && (
        <DaySheet
          day={daySheet.day}
          expenses={daySheet.expenses}
          month={month}
          year={year}
          onClose={() => setDaySheet(null)}
          onSettle={() => {}}
          onDelete={deleteExp}
          onSaved={fetchAll}
          setToast={setToast}
          categories={categories}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
