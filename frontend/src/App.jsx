import { useEffect, useRef, useState } from "react";

import api, { setAuthToken } from "./api";
import AddModal from "./components/AddModal";
import AuthScreen from "./components/AuthScreen";
import DayCell from "./components/DayCell";
import DaySheet from "./components/DaySheet";
import HelpModal from "./components/HelpModal";
import OverviewPage from "./components/OverviewPage";
import SearchModal from "./components/SearchModal";
import Toast from "./components/Toast";
import { DAYS, MONTHS } from "./constants";
import styles from "./App.module.css";
import calendarStyles from "./styles/calendar.module.css";
import { parseLocalDate } from "./utils";

const NOW_MONTH = new Date().getMonth();
const NOW_YEAR = new Date().getFullYear();

setAuthToken(localStorage.getItem("token"));

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
  const [showHelp, setShowHelp] = useState(false);
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
    if (activeTab !== "calendar" || !user) return;
    const scrollToActive = () => {
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
    };
    const id = requestAnimationFrame(scrollToActive);
    return () => cancelAnimationFrame(id);
  }, [month, activeTab, user]);

  useEffect(() => {
    const anyOpen = showAdd || showSearch || !!daySheet;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAdd, showSearch, daySheet]);

  useEffect(() => {
    if (!daySheet) return;
    const stillHasExpenses = expenses.some((e) => {
      const d = parseLocalDate(e.date);
      return (
        d &&
        d.getDate() === daySheet.day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
    if (!stillHasExpenses) setDaySheet(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const fetchAll = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/categories"),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data.categories || []);
    } catch {}
  };

  const addCategory = async (cat) => {
    try {
      const res = await api.post("/categories", cat);
      setCategories((prev) => [...prev, res.data.category]);
    } catch {}
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
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
      await api.post(`/categories/${id}/reassign-and-delete`, { targetId });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      fetchAll(); // refresh expenses since their category changed
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Failed to reassign and delete.",
      );
    }
  };

  const handleLogin = (u) => {
    setAuthToken(localStorage.getItem("token"));
    setUser(u);
    fetchAll();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    setExpenses([]);
    setCategories([]);
  };

  const deleteExp = async (id) => {
    await api.delete(`/expenses/${id}`);
    fetchAll();
  };

  const handleSelectDay = (day, month, year) => {
    setMonth(month);
    setYear(year);
    setDaySheet({ day });
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
    const d = parseLocalDate(e.date);
    return d && d.getMonth() === month && d.getFullYear() === year;
  });

  const byDay = monthExpenses.reduce((acc, e) => {
    const day = parseLocalDate(e.date).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
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

  const daySheetExpenses = daySheet
    ? monthExpenses.filter(
        (e) => parseLocalDate(e.date).getDate() === daySheet.day,
      )
    : [];

  const getMonthRingClass = (i) => {
    const isActive = i === month;
    const hasExp = expenses.some((e) => {
      const d = parseLocalDate(e.date);
      return d && d.getMonth() === i && d.getFullYear() === year;
    });
    if (isActive) return styles.monthRingActive;
    if (hasExp) return styles.monthRingHasExp;
    return styles.monthRingInactive;
  };

  return (
    <div className={styles.root}>
      {activeTab === "calendar" && (
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.logo}>snapspend</h1>
              <p className={styles.greeting}>Hi, {user?.name}</p>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={() => setShowHelp(true)}
                className={styles.helpBtn}
              >
                ?
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className={styles.iconBtn}
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
              <div className={styles.yearNav}>
                <button
                  onClick={() => setYear((y) => y - 1)}
                  className={styles.yearBtn}
                >
                  ‹
                </button>
                <span className={styles.yearLabel}>{year}</span>
                <button
                  onClick={() => setYear((y) => y + 1)}
                  className={styles.yearBtn}
                >
                  ›
                </button>
              </div>
              <div className={styles.avatarWrap}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={styles.avatarBtn}
                >
                  <div className={styles.avatar}>
                    <div className={styles.avatarInner}>
                      {user?.name?.[0]?.toUpperCase() || "S"}
                    </div>
                  </div>
                </button>
                {showProfileMenu && (
                  <>
                    <div
                      className={styles.menuBackdrop}
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className={styles.profileMenu}>
                      <div className={styles.profileMenuHeader}>
                        <div className={styles.profileName}>{user.name}</div>
                        <div className={styles.profileEmail}>{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className={styles.signOutBtn}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div ref={monthStripRef} className={styles.monthStrip}>
            {MONTHS.map((m, i) => {
              const isActive = i === month;
              const isToday = i === NOW_MONTH && year === NOW_YEAR;
              const ringClass = getMonthRingClass(i);
              return (
                <div
                  key={m}
                  data-active={isActive}
                  className={styles.monthItem}
                  onClick={() => setMonth(i)}
                >
                  <div className={ringClass}>
                    <div
                      className={
                        isActive || ringClass === styles.monthRingHasExp
                          ? styles.monthInnerActive
                          : styles.monthInnerInactive
                      }
                    >
                      {m.slice(0, 3)}
                    </div>
                  </div>
                  {isToday && (
                    <div
                      className={`${styles.todayDot} ${
                        isActive
                          ? styles.todayDotActive
                          : styles.todayDotInactive
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className={calendarStyles.grid}>
            {DAYS.map((d) => (
              <div key={d} className={calendarStyles.dayLabel}>
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

      <div className={styles.bottomBar}>
        <button
          className={styles.tabBtn}
          onClick={() => setActiveTab("calendar")}
        >
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
          {activeTab === "calendar" && <div className={styles.tabDot} />}
        </button>

        <>
          <button
            className={styles.fabBtn}
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
            className={styles.hiddenInput}
            onChange={(e) => {
              if (e.target.files[0]) {
                setGalleryFile(e.target.files[0]);
                setShowAdd(true);
              }
            }}
          />
        </>

        <button
          className={styles.tabBtn}
          onClick={() => setActiveTab("overview")}
        >
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
          {activeTab === "overview" && <div className={styles.tabDot} />}
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
          expenses={daySheetExpenses}
          month={month}
          year={year}
          onClose={() => setDaySheet(null)}
          onDelete={deleteExp}
          onSaved={fetchAll}
          setToast={setToast}
          categories={categories}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
